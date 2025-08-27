import { useState, useEffect } from 'react';
import type { HarvestSummary } from '../../../shared/types';
import { doc, onSnapshot } from 'firebase/firestore';
import useAuth from '../../../shared/context/auth/AuthContext';
import { db } from '../../../shared/firebase/firebase';

export const useHarvestSummary = (
    campaignId?: string,
    cropId?: string,
    fieldId?: string,
    plotId?: string
) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestSummary, setHarvestSummary] = useState<HarvestSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId || !cropId) {
            if (!authLoading) setLoading(false);
            setHarvestSummary(null);
            return;
        }

        if (currentUser.role === 'field-owner' && (!fieldId || fieldId === 'all')) {
            setLoading(false);
            setHarvestSummary(null);
            return;
        }


        setLoading(true);
        setError(null);

        let documentId = `camp_${campaignId}_crop_${cropId}`;

        if (fieldId && fieldId !== 'all') {
            documentId += `_field_${fieldId}`;
        }

        if (plotId && plotId !== 'all' && fieldId && fieldId !== 'all') {
            documentId += `_plot_${plotId}`;
        }

        const harvestSummaryDoc = doc(db, 'harvest_analytics_summary', documentId);

        const unsubscribe = onSnapshot(harvestSummaryDoc, (snapshot) => {
            if (snapshot.exists()) {
                const harvestSummaryData = { id: snapshot.id, ...snapshot.data() };
                setHarvestSummary(harvestSummaryData as HarvestSummary);
            } else {
                setHarvestSummary(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestSummary, loading, error };
};