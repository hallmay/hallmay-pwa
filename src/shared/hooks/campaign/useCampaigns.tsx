import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Campaign } from '../../types';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useCampaigns = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).build();

        const campaignsQuery = query(
            collection(db, 'campaigns'),
            ...securityConstraints,
            orderBy('start_date', 'desc')
        );

        const unsubscribe = onSnapshot(campaignsQuery, (snapshot) => {
            const campaignsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Campaign, 'id'>)
            }));
            setCampaigns(campaignsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a campañas:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading]);

    return { campaigns, loading, error };
};