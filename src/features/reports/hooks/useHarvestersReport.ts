import { query, collection, where, onSnapshot, documentId } from "firebase/firestore";
import { useState, useEffect } from "react";
import useAuth from "../../../shared/context/auth/AuthContext";
import { db } from "../../../shared/firebase/firebase";
import type { HarvestersSummary } from "../../../shared/types";
import { createSecurityQuery } from "../../../shared/firebase/queryBuilder";

export const useHarvestersSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestersSummary, setHarvestersSummary] = useState<HarvestersSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId || !cropId) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const securityConstraints = createSecurityQuery(currentUser)
            .withFieldAccess('field.id')
            .build();

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

        const harvestersSummaryQuery = query(
            collection(db, 'harvester_analytics_summary'),
            ...securityConstraints,
            where(documentId(), ">=", docId),
            where(documentId(), "<", docId + '\uf8ff'),
            where('aggregation_level', '==', aggregationLevel)
        );

        const unsubscribe = onSnapshot(harvestersSummaryQuery, (snapshot) => {
            const summaryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<HarvestersSummary, 'id'>)
            }));
            setHarvestersSummary(summaryData);
            setLoading(false);
        }, (err) => {
            console.error("Error in harvesters_summary subscription:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestersSummary, loading, error };
};