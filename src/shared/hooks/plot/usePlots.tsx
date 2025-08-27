import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Plot } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { createSecurityQuery } from '../../firebase/queryBuilder';

export const usePlots = (fieldId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [plots, setPlots] = useState<Plot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !fieldId) {
            setLoading(false);
            setPlots([]);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser)
            .withFieldAccess('field.id')
            .build();

        const plotsQuery = query(
            collection(db, 'plots'),
            ...securityConstraints,
            where('field.id', '==', fieldId)
        );

        const unsubscribe = onSnapshot(plotsQuery, (snapshot) => {
            const plotsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Plot, 'id'>)
            }));
            setPlots(plotsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a lotes:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, fieldId]);

    return { plots, loading, error };
};