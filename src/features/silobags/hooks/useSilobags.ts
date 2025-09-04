import { useMemo } from 'react';
import { useSilobagsRealtime } from './useSilobagsRealtime';
import { useSilobagsFinished } from './useSilobagsFinished';

interface SiloBagFilters {
    fieldId?: string | null;
    cropId?: string | null;
    status?: string | null;
}

export const useSiloBags = (campaignId: string | undefined, fieldId: string, filters: SiloBagFilters = {}) => {
    const memoizedFilters = useMemo(() => ({
        cropId: filters.cropId || 'all',
        status: filters.status || 'all'
    }), [filters.cropId, filters.status]);

    const realtimeEnabled = memoizedFilters.status === 'active' || memoizedFilters.status === 'all';
    const finishedEnabled = memoizedFilters.status === 'finished' || memoizedFilters.status === 'all';

    const { data: active = [], loading: loadingActive, error: errorActive } = useSilobagsRealtime(
        campaignId,
        fieldId,
        memoizedFilters.cropId === 'all' ? null : filters.cropId,
        realtimeEnabled && !!campaignId && !!fieldId
    );

    const { data: finished = [], loading: loadingFinished, error: errorFinished } = useSilobagsFinished(
        campaignId,
        fieldId,
        memoizedFilters.cropId === 'all' ? null : filters.cropId,
        finishedEnabled && !!campaignId && !!fieldId
    );

    const siloBags = useMemo(() => {
        if (memoizedFilters.status === 'active') return active;
        if (memoizedFilters.status === 'finished') return finished;
        return [...active, ...finished];
    }, [active, finished, memoizedFilters.status]);

    return { siloBags, loading: loadingActive || loadingFinished, error: errorActive || errorFinished };
};