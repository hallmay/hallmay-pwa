// src/context/sync/SyncProvider.tsx
import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { primeOfflineCache } from '../../services/priming';
import useAuth from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { useDeviceType } from '../../hooks/useDeviceType';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


interface SyncContextType {
    isSyncing: boolean;
    lastSync: Date | null;
    syncError: Error | null;
    triggerSync: () => Promise<boolean>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const MANUAL_SYNC_RATE_LIMIT_MS = 1000 * 60 * 60;
const RECONNECT_STALE_THRESHOLD_MS = 1000 * 60 * 15;

export const SyncProvider = ({ children }: { children: ReactNode }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(() => {
        const saved = localStorage.getItem('lastSync');
        return saved ? new Date(saved) : null;
    });
    const [syncError, setSyncError] = useState<Error | null>(null);
    const { currentUser } = useAuth();
    const { isMobileOrTablet } = useDeviceType();
    
    // Inicializar lastManualSyncAttempt con valor del localStorage si existe
    const getInitialLastManualSync = () => {
        const saved = localStorage.getItem('lastManualSyncAttempt');
        return saved ? parseInt(saved, 10) : 0;
    };
    const lastManualSyncAttempt = useRef<number>(getInitialLastManualSync());

    const triggerSync = useCallback(async (isManual = false): Promise<boolean> => {
        const now = Date.now();

        if (isManual) {
            const timeSinceLastAttempt = now - lastManualSyncAttempt.current;
            if (timeSinceLastAttempt < MANUAL_SYNC_RATE_LIMIT_MS) {
                const remainingTimeMs = MANUAL_SYNC_RATE_LIMIT_MS - timeSinceLastAttempt;
                const futureUnlockTime = new Date(now + remainingTimeMs);
                const friendlyTime = formatDistanceToNow(futureUnlockTime, { addSuffix: true, locale: es });
                toast.error(`Sincronización manual disponible ${friendlyTime}.`, { duration: 5000 });
                return false;
            }
        }

        if (isSyncing) return false;

        if (!navigator.onLine) {
            if (isManual) toast('No hay conexión. La app funciona con datos locales.', { icon: '🟡' });
            return false;
        }
        if (!currentUser) return false;

        setIsSyncing(true);
        setSyncError(null);


        try {
            await primeOfflineCache(currentUser);

            const syncDate = new Date();
            setLastSync(syncDate);
            localStorage.setItem('lastSync', syncDate.toISOString());
            localStorage.setItem('lastSyncDate', syncDate.toISOString().split('T')[0]);

            if (isManual) {
                lastManualSyncAttempt.current = now;
                localStorage.setItem('lastManualSyncAttempt', now.toString());
                toast.success('Sincronización manual completada.');
            }
            return true;
        } catch (error: any) {
            setSyncError(error);
            toast.error('Hubo un error durante la sincronización.');
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, [currentUser, isSyncing]);

    useEffect(() => {
        if (currentUser && !isSyncing && isMobileOrTablet) {
            const today = new Date().toISOString().split('T')[0];
            const lastSyncDate = localStorage.getItem('lastSyncDate');
            if (today !== lastSyncDate) {
                triggerSync();
            }
        }
    }, [currentUser, isSyncing, triggerSync, isMobileOrTablet]);

    // Memoizar el handler del evento online para evitar re-renders
    const handleOnline = useCallback(() => {
        if (currentUser && !isSyncing && isMobileOrTablet) {
            const timeSinceLastSync = lastSync ? new Date().getTime() - lastSync.getTime() : Infinity;
            if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                triggerSync();
            }
        }
    }, [currentUser, isSyncing, lastSync, triggerSync, isMobileOrTablet]);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [handleOnline]);

    // Memoizar el handler de visibility change para evitar re-renders
    const handleVisibilityChange = useCallback(async () => {
        if (document.visibilityState === 'visible' && lastSync && !isSyncing && isMobileOrTablet) {
            const timeSinceLastSync = new Date().getTime() - lastSync.getTime();

            if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                triggerSync(false);
            }
        }
    }, [lastSync, isSyncing, triggerSync, isMobileOrTablet]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [handleVisibilityChange]);

    useEffect(() => {
        if (!currentUser) {
            setLastSync(null);
            localStorage.removeItem('lastSync');
            localStorage.removeItem('lastSyncDate');
            setSyncError(null);
            lastManualSyncAttempt.current = 0;
        }
    }, [currentUser]);

    // Memoizar el triggerSync manual para evitar recrear la función en cada render
    const manualTriggerSync = useCallback(() => triggerSync(true), [triggerSync]);

    // Memoizar el value del contexto para evitar re-renders de los componentes que lo consumen
    const value = useMemo((): SyncContextType => ({
        isSyncing,
        lastSync,
        syncError,
        triggerSync: manualTriggerSync
    }), [isSyncing, lastSync, syncError, manualTriggerSync]);

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = (): SyncContextType => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync debe ser usado dentro de un SyncProvider');
    }
    return context;
};