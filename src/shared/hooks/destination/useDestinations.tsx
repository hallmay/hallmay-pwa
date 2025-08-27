import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Destination } from '../../types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const useDestinations = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser).build();

        const destinationsQuery = query(
            collection(db, 'destinations'),
            ...securityConstraints
        );

        const unsubscribe = onSnapshot(destinationsQuery, (snapshot) => {
            const destinationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Destination, 'id'>)
            }));
            setDestinations(destinationsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a destinos:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading]);

    return { destinations, loading, error };
};