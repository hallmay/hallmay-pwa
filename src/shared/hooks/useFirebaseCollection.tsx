import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import useAuth from '../context/auth/AuthContext';
import { createSecurityQuery } from '../firebase/queryBuilder';

interface UseFirebaseCollectionOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  securityOptions?: {
    withFieldAccess?: string;
  };
  dependencies?: any[];
  enabled?: boolean;
}

interface UseFirebaseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirebaseCollection<T = any>({
  collectionName,
  constraints = [],
  securityOptions,
  dependencies = [],
  enabled = true
}: UseFirebaseCollectionOptions): UseFirebaseCollectionResult<T> {
  const { currentUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Crear un string único de dependencies para evitar referencia cambiante
  const dependencyKey = useMemo(() => {
    if (!dependencies || dependencies.length === 0) return 'no-deps';
    return JSON.stringify(dependencies);
  }, dependencies);

  // Crear un key estable para constraints para evitar problemas de tamaño cambiante
  const constraintsKey = useMemo(() => JSON.stringify(constraints), [JSON.stringify(constraints)]);

  // Memoizar las constraints para evitar re-renders
  const memoizedConstraints = useMemo(() => constraints, [constraintsKey]);

  // Memoizar las constraints de seguridad para evitar re-renders
  const securityConstraints = useMemo(() => {
    if (!currentUser || !enabled) return [];
    
    const queryBuilder = createSecurityQuery(currentUser);
    if (securityOptions?.withFieldAccess) {
      queryBuilder.withFieldAccess(securityOptions.withFieldAccess);
    }
    return queryBuilder.build();
  }, [currentUser, securityOptions?.withFieldAccess, enabled]);

  // Memoizar la query final
  const finalQuery = useMemo(() => {
    if (!currentUser || !enabled || authLoading) return null;
    
    return query(
      collection(db, collectionName),
      ...securityConstraints,
      ...memoizedConstraints
    );
  }, [collectionName, securityConstraints, memoizedConstraints, currentUser, enabled, authLoading]);

  useEffect(() => {
    if (authLoading || !currentUser || !enabled || !finalQuery) {
      if (!authLoading) {
        setLoading(false);
        setData([]);
      }
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error en suscripción a ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [finalQuery, authLoading, currentUser, enabled, collectionName, dependencyKey]);

  return { data, loading, error };
}
