import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Campaign } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useActiveCampaign = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) return;

        const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('organization_id', '==', currentUser.organizationId),
            where('active', '==', true)
        );

        const unsubscribe = onSnapshot(campaignsQuery,
            (snapshot) => {
                if (!snapshot.empty) {
                    const campaignsData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() as Omit<Campaign, 'id'> };
                    setCampaign(campaignsData);
                    setLoading(false)
                } else {
                    setCampaign(null);
                    setLoading(false)
                }
            },
            (err) => {

                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };

    }, [currentUser, authLoading]);

    return { campaign, loading, error };
};