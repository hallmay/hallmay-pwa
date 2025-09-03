import { endOfDay, startOfDay } from "date-fns";
import { orderBy, where, Timestamp, QueryConstraint, limit } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseQuery } from "../../../shared/hooks/useFirebaseQuery";
import { useFirebaseOnSnapshot } from "../../../shared/hooks/useFirebaseOnSnapshot";
import { Logistics } from "../../../shared/types";
import { ACTIVE_LOGISTICS_STATUSES } from "../../../shared/utils/logistics";

export const useLogistics = (
    dateRange: { from: Date | null, to: Date | null },
    selectedField: string,
    campaignId: string
) => {

    const constraints = useMemo(() => {
        if (!campaignId) return [];
        const baseConstraints: QueryConstraint[] = [where('campaign.id', '==', campaignId), orderBy('date', 'desc')];
        if (dateRange.from) {
            baseConstraints.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
        }
        if (dateRange.to) {
            baseConstraints.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
        }
        if (selectedField && selectedField !== 'all') {
            baseConstraints.push(where('field.id', '==', selectedField));
        }
        return baseConstraints;
    }, [dateRange.from, dateRange.to, selectedField, campaignId]);

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

    const todayRealtimeConstraintsByStatus = useMemo(() => {
        if (!campaignId || !isTodayRange) return {} as Record<string, QueryConstraint[]>;
        const now = new Date();
        const start = Timestamp.fromDate(startOfDay(now));
        const end = Timestamp.fromDate(endOfDay(now));
        const base: QueryConstraint[] = [
            where('campaign.id', '==', campaignId),
            where('date', '>=', start),
            where('date', '<=', end),
        ];
        if (selectedField && selectedField !== 'all') {
            base.push(where('field.id', '==', selectedField));
        }
        return {
            [ACTIVE_LOGISTICS_STATUSES[0]]: [
                ...base,
                where('status', '==', ACTIVE_LOGISTICS_STATUSES[0]),
                orderBy('date', 'desc')
            ],
            [ACTIVE_LOGISTICS_STATUSES[1]]: [
                ...base,
                where('status', '==', ACTIVE_LOGISTICS_STATUSES[1]),
                orderBy('date', 'desc')
            ]
        };
    }, [campaignId, isTodayRange, selectedField]);

    const todayRealtimeConstraintsRoute = todayRealtimeConstraintsByStatus[ACTIVE_LOGISTICS_STATUSES[0]] ?? [];
    const todayRealtimeConstraintsField = todayRealtimeConstraintsByStatus[ACTIVE_LOGISTICS_STATUSES[1]] ?? [];

    const { data: todayRouteData, loading: loadingTodayRoute, error: errorTodayRoute } = useFirebaseOnSnapshot<Logistics>({
        collectionName: 'logistics',
        constraints: todayRealtimeConstraintsRoute,
        dependencies: [campaignId, selectedField, dateRange.from?.getTime(), dateRange.to?.getTime()],
        enabled: !!campaignId && isTodayRange
    });

    const { data: todayFieldData, loading: loadingTodayField, error: errorTodayField } = useFirebaseOnSnapshot<Logistics>({
        collectionName: 'logistics',
        constraints: todayRealtimeConstraintsField,
        dependencies: [campaignId, selectedField, dateRange.from?.getTime(), dateRange.to?.getTime()],
        enabled: !!campaignId && isTodayRange
    });

    const historicalConstraints = useMemo(() => {
        if (!campaignId) return [] as QueryConstraint[];
        const base = [...constraints];
        if (isTodayRange) {
            base.push(where('status', 'in', ['closed']));
        }
        base.push(limit(200));
        return base;
    }, [constraints, campaignId, isTodayRange]);

    const { data: historicalData, loading: loadingHistorical, error: errorHistorical } = useFirebaseQuery<Logistics>({
        collectionName: 'logistics',
        constraints: historicalConstraints,
        dependencies: [campaignId, selectedField, dateRange.from?.getTime(), dateRange.to?.getTime()],
        enabled: !!campaignId && (isTodayRange || !isTodayRange)
    });
    
    const logistics = useMemo(() => {
        if (isTodayRange) {
        const combined = [...(todayRouteData ?? []), ...(todayFieldData ?? []), ...(historicalData ?? [])];
        return combined.sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0));
        }
        return historicalData;
    }, [isTodayRange, todayRouteData, todayFieldData, historicalData]);

    const loading = isTodayRange ? ((loadingTodayRoute || loadingTodayField) || loadingHistorical) : loadingHistorical;
    const error = isTodayRange ? (errorTodayRoute || errorTodayField || errorHistorical) : errorHistorical;

    return { logistics, loading, error };
};