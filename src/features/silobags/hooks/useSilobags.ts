import { useMemo } from 'react';
import type { Silobag } from '../../../shared/types';
import { where, orderBy } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import { useFirebaseQuery } from '../../../shared/hooks/useFirebaseQuery';

interface SiloBagFilters {
    fieldId?: string | null;
    cropId?: string | null;
    status?: string | null;
}

export const useSiloBags = (campaignId: string | null, fieldId: string, filters: SiloBagFilters = {}) => {
    const memoizedFilters = useMemo(() => ({
        cropId: filters.cropId || 'all',
        status: filters.status || 'all'
    }), [filters.fieldId, filters.cropId, filters.status]);

    // Realtime para activos (status=active); finished a demanda; si status = all, mezclamos ambos patrones
    const baseConstraints = useMemo(() => {
        if (!campaignId || !fieldId) return [] as any[];
        const q = [
            where('campaign.id', '==', campaignId),
            where('field.id', '==', fieldId),
            orderBy('date', 'desc')
        ];
        if (memoizedFilters.cropId && memoizedFilters.cropId !== 'all') {
            q.push(where('crop.id', '==', memoizedFilters.cropId));
        }
        return q;
    }, [campaignId, fieldId, memoizedFilters.cropId]);

    const activeConstraints = useMemo(() => {
        if (!campaignId || !fieldId) return [] as any[];
        return [...baseConstraints, where('status', '==', 'active')];
    }, [baseConstraints, campaignId, fieldId]);

    const finishedConstraints = useMemo(() => {
        if (!campaignId || !fieldId) return [] as any[];
        return [...baseConstraints, where('status', '==', 'finished')];
    }, [baseConstraints, campaignId, fieldId]);

    const realtimeEnabled = memoizedFilters.status === 'active' || memoizedFilters.status === 'all';
    const includeFinished = memoizedFilters.status === 'finished' || memoizedFilters.status === 'all';

    const { data: active, loading: loadingActive, error: errorActive } = useFirebaseOnSnapshot<Silobag>({
        collectionName: 'silo_bags',
        constraints: activeConstraints,
        dependencies: [fieldId, memoizedFilters.cropId, memoizedFilters.status, campaignId],
        enabled: realtimeEnabled && (!!campaignId && !!fieldId)
    });

    const { data: finished, loading: loadingFinished, error: errorFinished } = useFirebaseQuery<Silobag>({
        collectionName: 'silo_bags',
        constraints: finishedConstraints,
        dependencies: [fieldId, memoizedFilters.cropId, memoizedFilters.status, campaignId],
        enabled: includeFinished && (!!campaignId && !!fieldId)
    });

    const siloBags = useMemo(() => {
        if (memoizedFilters.status === 'active') return active;
        if (memoizedFilters.status === 'finished') return finished;
        return [...active, ...finished];
    }, [active, finished, memoizedFilters.status]);

    return { siloBags, loading: loadingActive || loadingFinished, error: errorActive || errorFinished };
};