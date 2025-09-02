import { useMemo } from 'react';
import type { HarvestSummary } from '../../../shared/types';
import useAuth from '../../../shared/context/auth/AuthContext';
import { useFirebaseDocument } from '../../../shared/hooks/useFirebaseDocument';

export const useHarvestSummary = (
    campaignId?: string,
    cropId?: string,
    fieldId?: string,
    plotId?: string
) => {
    const { currentUser, loading: authLoading } = useAuth();

    // Construir el documentId basado en los parámetros
    const documentId = useMemo(() => {
        if (!campaignId || !cropId) return null;
        
        if (currentUser?.role === 'field-owner' && (!fieldId || fieldId === 'all')) {
            return null;
        }

        let docId = `camp_${campaignId}_crop_${cropId}`;

        if (fieldId && fieldId !== 'all') {
            docId += `_field_${fieldId}`;
        }

        if (plotId && plotId !== 'all' && fieldId && fieldId !== 'all') {
            docId += `_plot_${plotId}`;
        }

        return docId;
    }, [campaignId, cropId, fieldId, plotId, currentUser?.role]);

    const { data: harvestSummary, loading, error, refetch } = useFirebaseDocument<HarvestSummary>({
        collectionName: 'harvest_analytics_summary',
        documentId,
        enabled: !!documentId && !authLoading && !!currentUser
    });

    return { 
        harvestSummary, 
        loading: authLoading || loading, 
        error,
        refetch 
    };
};