import { endOfDay, startOfDay } from "date-fns";
import { orderBy, where, Timestamp, QueryConstraint, limit } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseQuery } from "../../../shared/hooks/useFirebaseQuery";
import { useFirebaseOnSnapshot } from "../../../shared/hooks/useFirebaseOnSnapshot";
import { Logistics } from "../../../shared/types";

export const useLogistics = (
    dateRange: { from: Date | null, to: Date | null },
    selectedField: string,
    campaignId: string
) => {

    const isTodayRange = useMemo(() => {
        const from = dateRange.from;
        const to = dateRange.to;
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        if (from && to) return from <= todayEnd && to >= todayStart;
        if (from && !to) return from <= todayEnd;
        if (!from && to) return to >= todayStart;
        return true;
    }, [dateRange.from, dateRange.to]);

    const todayRealtimeConstraints = useMemo(() => {
        if (!campaignId || !isTodayRange || !selectedField) return;
        const now = new Date();
        const start = Timestamp.fromDate(startOfDay(now));
        const end = Timestamp.fromDate(endOfDay(now));
        const base: QueryConstraint[] = [
            where('campaign.id', '==', campaignId),
            where('field.id', '==', selectedField),
            where('date', '>=', start),
            where('date', '<=', end),
            where('active', '==', true),
            orderBy('date', 'desc')
        ];
       return base;
    }, [campaignId, isTodayRange, selectedField]);

    

    const { data: todayData, loading: loadingTodayData, error: errorTodayData } = useFirebaseOnSnapshot<Logistics>({
        collectionName: 'logistics',
        constraints: todayRealtimeConstraints,
        dependencies: [campaignId, selectedField, dateRange.from?.getTime(), dateRange.to?.getTime()],
        enabled: !!campaignId && !!selectedField && isTodayRange
    });

    const historicalConstraints = useMemo(() => {
        if (!campaignId || !selectedField) return [] as QueryConstraint[];
        const base: QueryConstraint[] = [];
        // Rebuild constraints without active filter; we want historical (non-today) documents.
        // Use the original dateRange bounds but exclude today's window if isTodayRange.
        const now = new Date();
        const todayStart = startOfDay(now);
        // Base mandatory filters
        base.push(where('campaign.id', '==', campaignId));
        base.push(where('field.id', '==', selectedField));

        // Apply date range filters except we split out today's docs (handled by realtime)
        if (dateRange.from) {
            base.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
        }
        if (dateRange.to) {
            base.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
        }
        if (isTodayRange) {
            // Exclude today's docs to avoid duplication with realtime listener
            base.push(where('date', '<', Timestamp.fromDate(todayStart)));
        }
        base.push(orderBy('date', 'desc'));
        base.push(limit(200));
        return base;
    }, [campaignId, selectedField, dateRange.from, dateRange.to, isTodayRange]);

    const { data: historicalData, loading: loadingHistorical, error: errorHistorical } = useFirebaseQuery<Logistics>({
        collectionName: 'logistics',
        constraints: historicalConstraints,
        dependencies: [campaignId, selectedField, dateRange.from?.getTime(), dateRange.to?.getTime()],
        enabled: !!campaignId && !!selectedField
    });
    
    const logistics = useMemo(() => {
        if (isTodayRange) {
        const combined = [...(todayData ?? []), ...(historicalData ?? [])];
        return combined.sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0));
        }
        return historicalData;
    }, [isTodayRange, todayData, historicalData]);

    const loading = isTodayRange ? (loadingTodayData || loadingHistorical) : loadingHistorical;
    const error = isTodayRange ? (errorTodayData || errorHistorical) : errorHistorical;

    return { logistics, loading, error };
};