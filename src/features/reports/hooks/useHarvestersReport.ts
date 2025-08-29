import { where, documentId } from "firebase/firestore";
import { useMemo } from "react";
import type { HarvestersSummary } from "../../../shared/types";
import { useFirebaseCollection } from "../../../shared/hooks/useFirebaseCollection";

export const useHarvestersSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    // Memoizar constraints para evitar re-renders
    const constraints = useMemo(() => {
        if (!campaignId || !cropId) return [];
        
        let docId = `camp_${campaignId}_crop_${cropId}`;
        let aggregationLevel = 'crop';

        if (fieldId) {
            docId += `_field_${fieldId}`;
            aggregationLevel = 'field';
        }

        if (plotId && fieldId) {
            docId += `_plot_${plotId}`;
            aggregationLevel = 'plot';
        }

        return [
            where(documentId(), ">=", docId),
            where(documentId(), "<", docId + '\uf8ff'),
            where('aggregation_level', '==', aggregationLevel)
        ];
    }, [campaignId, cropId, fieldId, plotId]);

    const { data: harvestersSummary, loading, error } = useFirebaseCollection<HarvestersSummary>({
        collectionName: 'harvester_analytics_summary',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [campaignId, cropId, fieldId, plotId],
        enabled: !!campaignId && !!cropId
    });

    return { harvestersSummary, loading, error };
};