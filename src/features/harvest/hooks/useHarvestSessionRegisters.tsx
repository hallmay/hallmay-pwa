import { useState, useEffect } from 'react';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { HarvestSessionRegister } from '../../../shared/types';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

export const useHarvestSessionRegisters = (harvestSessionId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [registers, setRegisters] = useState<HarvestSessionRegister[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !harvestSessionId) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).withFieldAccess('field.id').build();

        const harvestSessionRegistersQuery = query(
            collection(db, `harvest_sessions/${harvestSessionId}/registers`),
            ...securityConstraints,
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(harvestSessionRegistersQuery, (snapshot) => {
            const harvestSessionRegistersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<HarvestSessionRegister, 'id'>)
            }));
            setRegisters(harvestSessionRegistersData);
            setLoading(false);
        }, (error) => {
            console.error("Error en la suscripción a registros de session de cosecha:", error);
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, harvestSessionId]);

    return { registers, loading, error };
};