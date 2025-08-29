import { useMemo } from 'react';
import type { Silobag } from '../../../shared/types';
import { where } from 'firebase/firestore';
import { useFirebaseCollection } from '../../../shared/hooks/useFirebaseCollection';

interface SiloBagFilters {
    fieldId: string;
    cropId: string;
    status: string;
}

export const useSiloBags = (filters: SiloBagFilters) => {
    // Memoizar constraints para evitar re-renders
    const constraints = useMemo(() => {
        const queryConstraints = [];
        
        if (filters.fieldId && filters.fieldId !== 'all') {
            queryConstraints.push(where('field.id', '==', filters.fieldId));
        }
        if (filters.cropId && filters.cropId !== 'all') {
            queryConstraints.push(where('crop.id', '==', filters.cropId));
        }
        if (filters.status && filters.status !== 'all') {
            queryConstraints.push(where('status', '==', filters.status));
        }
        
        return queryConstraints;
    }, [filters.fieldId, filters.cropId, filters.status]);

    const { data: siloBags, loading, error } = useFirebaseCollection<Silobag>({
        collectionName: 'silo_bags',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [filters.fieldId, filters.cropId, filters.status]
    });

    return { siloBags, loading, error };
};