import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { SilobagMovement } from '../../../shared/types';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

export const useSiloBagMovements = (siloBagId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [movements, setMovements] = useState<SilobagMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !siloBagId) {
            if (!authLoading) setLoading(false);
            setMovements([]);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).withFieldAccess('field.id').build();

        const q = query(
            collection(db, `silo_bags/${siloBagId}/movements`),
            ...securityConstraints,
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const movementsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SilobagMovement));
            setMovements(movementsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a movimientos:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [siloBagId, currentUser, authLoading]);

    return { movements, loading, error };
};