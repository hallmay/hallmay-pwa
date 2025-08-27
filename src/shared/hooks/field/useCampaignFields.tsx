import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { CampaignField } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useCampaignFields = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaignFields, setCampaignFields] = useState<CampaignField[]>([]);
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
            collection(db, 'campaign_fields'),
            ...securityConstraints,
            where('campaign.id', '==', campaignId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CampaignField }));
            setCampaignFields(data);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción de CampaignFields:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUser, authLoading, campaignId]);

    return { campaignFields, loading, error };
};