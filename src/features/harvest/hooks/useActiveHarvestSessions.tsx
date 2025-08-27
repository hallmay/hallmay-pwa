import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { HarvestSession } from '../../../shared/types';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

export const useActiveHarvestSessions = (campaignId: string, selectedFieldId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const securityConstraints = createSecurityQuery(currentUser)
            .withFieldAccess('field.id')
            .build();

        let finalConstraints = [
            ...securityConstraints,
            where('campaign.id', '==', campaignId),
            where('status', 'in', ['pending', 'in-progress'])
        ];

        if (selectedFieldId && selectedFieldId !== 'all') {
            finalConstraints.push(where('field.id', '==', selectedFieldId));
        }

        const finalQuery = query(collection(db, 'harvest_sessions'), ...finalConstraints);

        const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
            const sessionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as HarvestSession));
            setSessions(sessionsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en active harvest sessions:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, campaignId, selectedFieldId]);

    return { sessions, loading, error };
};