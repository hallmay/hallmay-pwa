import { useState, useEffect } from 'react';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { Silobag } from '../../../shared/types';
import { collection, onSnapshot, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

interface SiloBagFilters {
    fieldId: string;
    cropId: string;
    status: string;
}

export const useSiloBags = (filters: SiloBagFilters) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [siloBags, setSiloBags] = useState<Silobag[]>([]);
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

        const constraints: QueryConstraint[] = [...securityConstraints];

        if (filters.fieldId && filters.fieldId !== 'all') {
            constraints.push(where('field.id', '==', filters.fieldId));
        }
        if (filters.cropId && filters.cropId !== 'all') {
            constraints.push(where('crop.id', '==', filters.cropId));
        }
        if (filters.status && filters.status !== 'all') {
            constraints.push(where('status', '==', filters.status));
        }

        const siloBagsQuery = query(collection(db, 'silo_bags'), ...constraints);

        const unsubscribe = onSnapshot(siloBagsQuery, (snapshot) => {
            setSiloBags(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Silobag })));
            if (loading) setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, authLoading, filters]);

    return { siloBags, loading, error };
};