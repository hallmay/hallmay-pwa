import { useState, useEffect } from 'react';
import type { HarvestSession } from '../../../shared/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import useAuth from '../../../shared/context/auth/AuthContext';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

export const useHarvestSessionsByCampaign = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser)
            .withFieldAccess('field.id')
            .build();

        const q = query(
            collection(db, 'harvest_sessions'), 
            ...securityConstraints,
            where('campaign.id', '==', campaignId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestSession)));
            if (loading) setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [campaignId, currentUser, authLoading]);

    return { sessions, loading, error };
};