import { useMemo } from 'react';
import type { Silobag } from '../../../shared/types';
import { where, orderBy } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';

interface SiloBagFilters {
    fieldId?: string | null;
    cropId?: string | null;
    status?: string | null;
}

export const useSiloBags = (campaignId: string | null,fieldId: string, filters: SiloBagFilters = {}) => {
    const memoizedFilters = useMemo(() => ({
        cropId: filters.cropId || 'all',
        status: filters.status || 'all'
    }), [filters.fieldId, filters.cropId, filters.status]);

    const constraints = useMemo(() => {
        if (!campaignId || !fieldId) return [];
        const queryConstraints = [
            where('campaign.id', '==', campaignId),orderBy('date', 'desc'),
            where('field.id', '==', fieldId)];
        if (memoizedFilters.cropId && memoizedFilters.cropId !== 'all') {
            queryConstraints.push(where('crop.id', '==', memoizedFilters.cropId));
        }
        if (memoizedFilters.status && memoizedFilters.status !== 'all') {
            queryConstraints.push(where('status', '==', memoizedFilters.status));
        }
        
        return queryConstraints;
    }, [memoizedFilters.cropId, memoizedFilters.status,fieldId,campaignId]);

    const { data: siloBags, loading, error } = useFirebaseOnSnapshot<Silobag>({
        collectionName: 'silo_bags',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [fieldId, memoizedFilters.cropId, memoizedFilters.status,campaignId],
        enabled: !!campaignId || !!fieldId
    });

    return { siloBags, loading, error };
};