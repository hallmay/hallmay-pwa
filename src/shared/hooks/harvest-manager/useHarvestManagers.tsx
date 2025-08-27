import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { HarvestManager } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useHarvestManagers = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestManagers, setHarvestManagers] = useState<HarvestManager[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).build();

        const harvestManagersQuery = query(
            collection(db, 'users'),
            ...securityConstraints,
            where('role', 'in', ['manager', 'admin'])
        );

        const unsubscribe = onSnapshot(harvestManagersQuery, (snapshot) => {
            const harvestManagerData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<HarvestManager, 'id'>)
            }));
            setHarvestManagers(harvestManagerData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a los responsables de cosecha:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading]);

    return { harvestManagers, loading, error };
};