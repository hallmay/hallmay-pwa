import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../auth/AuthContext';
import type { Campaign, CampaignField, Crop, Destination, Harvester, HarvestManager, User } from '../../types';
import { createSecurityQuery } from '../../firebase/queryBuilder';
import { chunkArray } from '../../firebase/utils';
import { useDeviceType } from '../../hooks/useDeviceType';
import { startOfDay, endOfDay } from 'date-fns';

interface ColdData {
    activeCampaign: Campaign | null;
    campaigns: Campaign[];
    campaignFields: CampaignField[];
    crops: Crop[];
    destinations: Destination[];
    harvesters: Harvester[];
    managers: HarvestManager[];
}

interface DataContextType extends ColdData {
    loading: boolean;
    syncStatus: SyncStatus;
    lastPrime: Date | null;
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData debe ser usado dentro de un DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useAuth();
    const { isMobileOrTablet } = useDeviceType();
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastPrime, setLastPrime] = useState<Date | null>(null);
    const [coldData, setColdData] = useState<ColdData>({
        activeCampaign: null,
        campaigns: [],
        campaignFields: [],
        crops: [],
        destinations: [],
        harvesters: [],
        managers: [],
    });

    const primeCriticalData = useCallback(async (user: User, activeCampaign: Campaign, fieldIds: string[]) => {
        if (!activeCampaign || !fieldIds || !isMobileOrTablet) return;

        setSyncStatus('syncing');
        const lastSyncItem = localStorage.getItem('lastPrimeSync');
        const lastSync = lastSyncItem ? Timestamp.fromDate(new Date(lastSyncItem)) : null;

        const baseConstraints = createSecurityQuery(user).build();
        const securityConstraints = lastSync
            ? [...baseConstraints, where('updated_at', '>', lastSync)]
            : baseConstraints;

        const isAdminLike = user.role === 'admin' || user.role === 'superadmin';
        let effectiveFieldIds = Array.from(new Set(fieldIds.filter(Boolean)));
        if (!isAdminLike) {
            const accessible = Array.from(new Set((user.accessibleFieldIds ?? []).filter(Boolean)));
            if (accessible.length === 0) {
                const now = new Date();
                setLastPrime(now);
                localStorage.setItem('lastPrimeSync', now.toISOString());
                setSyncStatus('synced');
                return true;
            }
            const allowed = new Set(accessible);
            effectiveFieldIds = effectiveFieldIds.filter(id => allowed.has(id));
        }

        if (effectiveFieldIds.length === 0) {
            const now = new Date();
            setLastPrime(now);
            localStorage.setItem('lastPrimeSync', now.toISOString());
            setSyncStatus('synced');
            return true;
        }

        const fieldChunks = chunkArray(effectiveFieldIds, 30);

        const plotPromises = fieldChunks.map(chunk =>
            getDocs(query(
                collection(db, 'plots'),
                ...securityConstraints,
                where('field.id', 'in', chunk)
            ))
        );

        const siloBagPromises = fieldChunks.map(chunk =>
            getDocs(query(
                collection(db, 'silo_bags'),
                ...securityConstraints,
                where('campaign.id', '==', activeCampaign.id),
                where('status', '==', 'active'),
                where('field.id', 'in', chunk)
            ))
        );

        const sessionPromises = fieldChunks.map(chunk =>
            getDocs(query(
                collection(db, 'harvest_sessions'),
                ...securityConstraints,
                where('campaign.id', '==', activeCampaign.id),
                where('active', '==', true),
                where('field.id', 'in', chunk)
            ))
        );

        const today = new Date();
        const todayStart = Timestamp.fromDate(startOfDay(today));
        const todayEnd = Timestamp.fromDate(endOfDay(today));


        const logisticsSnap = fieldChunks.map(chunk =>
            getDocs(query(
                collection(db, 'logistics'),
                ...baseConstraints,
                where('campaign.id', '==', activeCampaign.id),
                where('active', '==', true),
                where('date', '>=', todayStart),
                where('date', '<=', todayEnd),
                where('field.id', 'in', chunk)
            ))
        );

    try {
        const [sessionsSnaps, siloBagsSnaps, _plotSnaps, _logisticsSnap] = await Promise.all([
            Promise.all(sessionPromises),
            Promise.all(siloBagPromises),
            Promise.all(plotPromises),
            Promise.all(logisticsSnap)
        ]);

        const sessions = { docs: sessionsSnaps.flatMap(snap => snap.docs) };
        const silobags = { docs: siloBagsSnaps.flatMap(snap => snap.docs) };

        const subcollectionPromises = [
            ...sessions.docs.map(doc => getDocs(query(collection(db, `harvest_sessions/${doc.id}/registers`), ...createSecurityQuery(user).build(),where('field.id','==',doc.data().field.id), orderBy('date', 'desc'), limit(10)))),
            ...silobags.docs.map(doc => getDocs(query(collection(db, `silo_bags/${doc.id}/movements`), ...createSecurityQuery(user).build(),where('field.id','==',doc.data().field.id), orderBy('date', 'desc'), limit(10))))
        ];

        await Promise.all(subcollectionPromises);

        const now = new Date();
        setLastPrime(now);
        localStorage.setItem('lastPrimeSync', now.toISOString());
        setSyncStatus('synced');
        return true;
    } catch (error) {
        console.error("Error durante la pre-carga:", error);
        setSyncStatus('error');
        return false;
    }
}, []);

const checkForActualChanges = async (fieldIds: string[], lastCheck: Date) => {
    if (fieldIds.length === 0) return false;

    const lastCheckTimestamp = Timestamp.fromDate(lastCheck);
    const fieldChunks = chunkArray(fieldIds, 10);

    try {
        const sessionChecks = await Promise.all(
            fieldChunks.map(chunk =>
                getDocs(query(
                    collection(db, 'harvest_sessions'),
                    where('organization_id', '==', currentUser?.organizationId),
                    where('field.id', 'in', chunk),
                    where('active', '==', true),
                    where('updated_at', '>', lastCheckTimestamp),
                    limit(1)
                ))
            )
        );

        if (sessionChecks.some(snap => snap.size > 0)) return true;

        const siloBagCheck = await getDocs(query(
            collection(db, 'silo_bags'),
            where('organization_id', '==', currentUser?.organizationId),
            where('status', '==', 'active'),
            where('updated_at', '>', lastCheckTimestamp),
            limit(1)
        ));

        if (siloBagCheck.size > 0) return true;

        const logisticsCheck = await getDocs(query(
            collection(db, 'logistics'),
            where('organization_id', '==', currentUser?.organizationId),
            where('active', '==', true),
            where('updated_at', '>', lastCheckTimestamp),
            limit(1)
        ));

        if (logisticsCheck.size > 0) return true;

        const plotChecks = await Promise.all(
            fieldChunks.map(chunk =>
                getDocs(query(
                    collection(db, 'plots'),
                    where('organization_id', '==', currentUser?.organizationId),
                    where('field.id', 'in', chunk),
                    where('updated_at', '>', lastCheckTimestamp),
                    limit(1)
                ))
            )
        );

        if (plotChecks.some(snap => snap.size > 0)) return true;

    } catch (error) {
        console.error('Error checking for changes:', error);
        return true;
    }
};

useEffect(() => {
    if (!currentUser) {
        setLoading(false);
        setColdData({ activeCampaign: null, campaigns: [], campaignFields: [], crops: [], destinations: [], harvesters: [], managers: [] });
        return;
    }

    setLoading(true);
    const collectionsToListen: (keyof Omit<ColdData, 'activeCampaign' | 'campaignFields' | 'managers'>)[] = ['campaigns', 'crops', 'destinations', 'harvesters'];

    const unsubscribes = collectionsToListen.map(name => {
        const q = query(collection(db, name), ...createSecurityQuery(currentUser).build());
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            setColdData(prev => ({ ...prev, [name]: data }));
        });
    });

    const managersQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'manager']), ...createSecurityQuery(currentUser).build());
    const unsubManagers = onSnapshot(managersQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HarvestManager[];
        setColdData(prev => ({ ...prev, managers: data }));
    });
    unsubscribes.push(unsubManagers);

    const activeCampaignQuery = query(collection(db, 'campaigns'), where('active', '==', true), ...createSecurityQuery(currentUser).build(), limit(1));
    const unsubCampaign = onSnapshot(activeCampaignQuery, (snapshot) => {
        const activeCampaign = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Campaign;
        setColdData(prev => ({ ...prev, activeCampaign }));
        if (!activeCampaign) setLoading(false);
    });
    unsubscribes.push(unsubCampaign);

    return () => unsubscribes.forEach(unsub => unsub());
}, [currentUser]);

useEffect(() => {
    if (!currentUser || !coldData.activeCampaign) return;

    const q = query(collection(db, 'campaign_fields'), where('campaign.id', '==', coldData.activeCampaign.id), ...createSecurityQuery(currentUser).withFieldAccess('field.id').build());
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CampaignField[];
        setColdData(prev => ({ ...prev, campaignFields: data }));

        if (snapshot.docs.length > 0 && coldData.activeCampaign) {
            const fieldIds = data.map(cf => cf.field?.id).filter((id): id is string => Boolean(id));
            primeCriticalData(currentUser, coldData.activeCampaign, fieldIds).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    });
    return () => unsubscribe();
}, [coldData.activeCampaign, currentUser, primeCriticalData]);

useEffect(() => {
    const REFRESH_THRESHOLD_MS = 1000 * 60 * 15;

    const handleAppVisibility = async () => {
        if (document.visibilityState === 'visible' && lastPrime && currentUser && !loading && coldData.activeCampaign && coldData.campaignFields.length > 0) {
            const timeSinceLastPrime = new Date().getTime() - lastPrime.getTime();
            if (timeSinceLastPrime > REFRESH_THRESHOLD_MS) {
                const fieldIds = coldData.campaignFields.map(cf => cf.field.id).filter((id): id is string => Boolean(id));
                const hasChanges = await checkForActualChanges(fieldIds, lastPrime);
                if (hasChanges) {
                    await primeCriticalData(currentUser, coldData.activeCampaign, fieldIds);
                } else {
                    setLastPrime(new Date());
                }
            }
        }
    };

    document.addEventListener('visibilitychange', handleAppVisibility);
    window.addEventListener('online', handleAppVisibility);

    return () => {
        document.removeEventListener('visibilitychange', handleAppVisibility);
        window.removeEventListener('online', handleAppVisibility);
    };
}, [currentUser, loading, lastPrime, coldData.campaignFields, coldData.activeCampaign, primeCriticalData]);

const value = useMemo(() => ({
    ...coldData,
    loading,
    syncStatus,
    lastPrime,
}), [coldData, loading, syncStatus, lastPrime]);

return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};