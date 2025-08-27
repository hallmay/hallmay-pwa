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

    // Armar parámetros de query de forma simple
    const queryParams = useMemo(() => {
        // Si no hay campaign + crop, no hacer query
        if (!filters.campaign || !filters.crop || filters.crop === 'all') {
            return null;
        }

        // Recoger solo los valores que no son 'all' o vacíos
        const params = {
            campaignId: filters.campaign,
            cropId: filters.crop,
            fieldId: filters.field !== 'all' ? filters.field : undefined,
            plotId: filters.plot !== 'all' ? filters.plot : undefined
        };

        return params;
    }, [filters.campaign, filters]);

    // Usar los parámetros en los hooks existentes
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