import { useMemo } from 'react';
import type { Silobag } from '../../../shared/types';
import { where, orderBy } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';

interface SiloBagFilters {
    fieldId?: string | null;
    cropId?: string | null;
    status?: string | null;
}

export const useSiloBags = (filters: SiloBagFilters = {}) => {
    const memoizedFilters = useMemo(() => ({
        fieldId: filters.fieldId || 'all',
        cropId: filters.cropId || 'all',
        status: filters.status || 'all'
    }), [filters.fieldId, filters.cropId, filters.status]);

    const constraints = useMemo(() => {
        const queryConstraints = [];
        
        if (memoizedFilters.fieldId && memoizedFilters.fieldId !== 'all') {
            queryConstraints.push(where('field.id', '==', memoizedFilters.fieldId));
        }
        if (memoizedFilters.cropId && memoizedFilters.cropId !== 'all') {
            queryConstraints.push(where('crop.id', '==', memoizedFilters.cropId));
        }
        if (memoizedFilters.status && memoizedFilters.status !== 'all') {
            queryConstraints.push(where('status', '==', memoizedFilters.status));
        }

        queryConstraints.push(orderBy('date', 'desc'));
        
        return queryConstraints;
    }, [memoizedFilters.fieldId, memoizedFilters.cropId, memoizedFilters.status]);

    const { data: siloBags, loading, error } = useFirebaseOnSnapshot<Silobag>({
        collectionName: 'silo_bags',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [memoizedFilters.fieldId, memoizedFilters.cropId, memoizedFilters.status],
    });

    return { siloBags, loading, error };
};