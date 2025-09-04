import { useMemo } from 'react';
import { orderBy, where } from 'firebase/firestore';
import type { SilobagMovement } from '../../../shared/types';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';

export const useSiloBagMovements = (siloBagId?: string, fieldId?: string) => {
    // Memoizar constraints
    const constraints = useMemo(() => {
        if (!fieldId) return [];
        return [
            where("field.id", "==", fieldId),
            orderBy("date", "desc"),
        ];
    }, [fieldId]);

    const { data: movements, loading, error } = useFirebaseOnSnapshot<SilobagMovement>({
        collectionName: `silo_bags/${siloBagId}/movements`,
        constraints,
        enabled: !!siloBagId || !!fieldId
    });

    return { movements, loading, error };
};