import { where, documentId } from "firebase/firestore";
import { useMemo } from "react";
import type { DestinationSummary } from "../../../shared/types";
import { useFirebaseCollection } from "../../../shared/hooks/useFirebaseCollection";

export const useDestinationSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
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

    const { data: destinationSummary, loading, error } = useFirebaseCollection<DestinationSummary>({
        collectionName: 'destination_analytics_summary',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [campaignId, cropId, fieldId, plotId],
        enabled: !!campaignId && !!cropId
    });

    return { destinationSummary, loading, error };
};