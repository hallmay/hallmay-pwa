// src/hooks/reports/useReportsAnalytics.tsx - Versión Simplificada
import { useMemo } from 'react';
import { useDestinationSummary } from './useDestinationsReport';
import { useHarvestersSummary } from './useHarvestersReport';
import { useHarvestSummary } from './useHarvestsReport';

interface ReportsFilters {
    campaign: string;
    crop: string;
    field: string;
    plot: string;
}

export const useReportsAnalytics = (filters: ReportsFilters) => {

    const queryParams = useMemo(() => {
        if (!filters.campaign || !filters.crop || filters.crop === 'all') {
            return null;
        }

        const params = {
            campaignId: filters.campaign,
            cropId: filters.crop,
            fieldId: filters.field !== 'all' ? filters.field : undefined,
            plotId: filters.plot !== 'all' ? filters.plot : undefined
        };

        return params;
    }, [filters.campaign, filters]);

    const harvestSummary = useHarvestSummary(
        queryParams?.campaignId,
        queryParams?.cropId,
        queryParams?.fieldId,
        queryParams?.plotId
    );

    const destinationSummary = useDestinationSummary(
        queryParams?.campaignId,
        queryParams?.cropId,
        queryParams?.fieldId,
        queryParams?.plotId
    );

    const harvestersSummary = useHarvestersSummary(
        queryParams?.campaignId,
        queryParams?.cropId,
        queryParams?.fieldId,
        queryParams?.plotId
    );

    return {
        harvestSummary: harvestSummary.harvestSummary,
        harvestersSummary: harvestersSummary.harvestersSummary,
        destinationSummary: destinationSummary.destinationSummary,
        loading: harvestSummary.loading || destinationSummary.loading || harvestersSummary.loading,
        error: harvestSummary.error || destinationSummary.error || harvestersSummary.error
    };
};