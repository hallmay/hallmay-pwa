import { endOfDay, startOfDay } from "date-fns";
import { useMemo } from "react";
import { useLogisticsRealtime } from "./useLogisticsRealtime";
import { useLogisticsHistorical } from "./useLogisticsHistorical";

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

    const { data: todayData, loading: loadingRealtime, error: errorRealtime } = useLogisticsRealtime(
        campaignId,
        selectedField,
        !!campaignId && !!selectedField && isTodayRange
    );

    const { data: historicalData, loading: loadingHistorical, error: errorHistorical } = useLogisticsHistorical(
        campaignId,
        selectedField,
        dateRange,
        isTodayRange // exclude today's docs if realtime active
    );
    
    const logistics = useMemo(() => {
        if (isTodayRange) {
        const combined = [...(todayData ?? []), ...(historicalData ?? [])];
        return combined.sort((a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0));
        }
        return historicalData;
    }, [isTodayRange, todayData, historicalData]);

    const loading = isTodayRange ? (loadingRealtime || loadingHistorical) : loadingHistorical;
    const error = isTodayRange ? (errorRealtime || errorHistorical) : errorHistorical;

    return { logistics, loading, error };
};