import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Crop } from '../../types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useCrops = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).build();

        const cropsQuery = query(
            collection(db, 'crops'),
            ...securityConstraints
        );

        const unsubscribe = onSnapshot(cropsQuery, (snapshot) => {
            const cropData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Crop, 'id'>)
            }));
            setCrops(cropData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a cultivos:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading]);

    return { crops, loading, error };
};