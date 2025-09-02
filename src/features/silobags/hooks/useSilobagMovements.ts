import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import type { SilobagMovement } from '../../../shared/types';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';

export const useSiloBagMovements = (siloBagId?: string) => {
    // Memoizar constraints
    const constraints = useMemo(() => [
        orderBy("date", "desc")
    ], []);

    const { data: movements, loading, error } = useFirebaseOnSnapshot<SilobagMovement>({
        collectionName: `silo_bags/${siloBagId}/movements`,
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [siloBagId],
        enabled: !!siloBagId
    });

    return { movements, loading, error };
};