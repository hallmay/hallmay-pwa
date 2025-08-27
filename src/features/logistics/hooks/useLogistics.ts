import { useState, useEffect } from 'react';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { Logistics } from '../../../shared/types';
import { collection, onSnapshot, query, where, orderBy, Timestamp, QueryConstraint } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import { startOfDay, endOfDay } from 'date-fns';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

export const useLogistics = (dateRange: { from: Date | null, to: Date | null }, selectedField: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [logistics, setLogistics] = useState<Logistics[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const securityConstraints = createSecurityQuery(currentUser)
            .withFieldAccess('field.id')
            .build();

        let constraints: QueryConstraint[] = [...securityConstraints];

        if (dateRange.from) {
            constraints.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
        }
        if (dateRange.to) {
            constraints.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
        }
        if (selectedField && selectedField !== 'all') {
            constraints.push(where('field.id', '==', selectedField));
        }
        constraints.push(orderBy('date', 'desc'));

        const logisticsQuery = query(collection(db, 'logistics'), ...constraints);

        const unsubscribe = onSnapshot(logisticsQuery, (snapshot) => {
            const logisticsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Logistics, 'id'>)
            }));
            setLogistics(logisticsData);
            setLoading(false);
        }, (err) => {
            console.error("Error en la suscripción a logística:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, dateRange.from, dateRange.to, selectedField]);

    return { logistics, loading, error };
};