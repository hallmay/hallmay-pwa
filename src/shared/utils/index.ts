import type { HarvestSession, Yield } from "../types";

export const formatNumber = (num: number, decimals = 0): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const getSessionWithRecalculatedYields = (session: HarvestSession): HarvestSession => {
    const harvestedKgs = session.harvested_kgs || 0;
    const harvestedHectares = session.harvested_hectares || 0;
    const sownHectares = session.hectares || 0;
    const estimatedYield = session.estimated_yield || 0;

    // Evitar divisiones por cero
    const yieldPerHarvested = harvestedHectares > 0 ? harvestedKgs / harvestedHectares : 0;
    const yieldPerSown = sownHectares > 0 ? harvestedKgs / sownHectares : 0;

    const newYields: Yield = {
        harvested: yieldPerHarvested,
        seed: yieldPerSown,
        real_vs_projected: yieldPerHarvested - estimatedYield,
    };

    return { ...session, yields: newYields };
};
