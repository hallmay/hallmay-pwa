// src/context/sync/SyncProvider.tsx
import { createContext, useState, useContext, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
    const lastManualSyncAttempt = useRef<number>(0);

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
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_SUCCESS' && isMobileOrTablet) {
                triggerSync(false);
            }
        };

        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [triggerSync, isMobileOrTablet]);

    useEffect(() => {
        if (currentUser && !isSyncing && isMobileOrTablet) {
            const today = new Date().toISOString().split('T')[0];
            const lastSyncDate = localStorage.getItem('lastSyncDate');
            if (today !== lastSyncDate) {
                triggerSync();
            }
        }
    }, [currentUser, isSyncing, triggerSync, isMobileOrTablet]);

    useEffect(() => {
        const handleOnline = () => {
            if (currentUser && !isSyncing && isMobileOrTablet) {
                const timeSinceLastSync = lastSync ? new Date().getTime() - lastSync.getTime() : Infinity;
                if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                    triggerSync();
                }
            }
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser, isSyncing, lastSync, triggerSync, isMobileOrTablet]);


    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && lastSync && !isSyncing && isMobileOrTablet) {
                const timeSinceLastSync = new Date().getTime() - lastSync.getTime();

                if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                    triggerSync(false);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [lastSync, isSyncing, triggerSync, isMobileOrTablet]);

    useEffect(() => {
        if (!currentUser) {
            setLastSync(null);
            localStorage.removeItem('lastSync');
            localStorage.removeItem('lastSyncDate');
            setSyncError(null);
            lastManualSyncAttempt.current = 0;
        }
    }, [currentUser]);

    const value: SyncContextType = {
        isSyncing,
        lastSync,
        syncError,
        triggerSync: () => triggerSync(true)
    };

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