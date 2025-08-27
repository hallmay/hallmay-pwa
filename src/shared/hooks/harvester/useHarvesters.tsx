import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Harvester } from '../../types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useHarvesters = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvesters, setHarvesters] = useState<Harvester[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).build();

        const harvestersQuery = query(
            collection(db, 'harvesters'),
            ...securityConstraints
        );

        const unsubscribe = onSnapshot(harvestersQuery, (snapshot) => {
            const harvestersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Harvester, 'id'>)
            }));
            setHarvesters(harvestersData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a cosecheros:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading]);

    return { harvesters, loading, error };
};