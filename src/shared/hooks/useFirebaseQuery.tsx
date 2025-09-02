import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import useAuth from '../context/auth/AuthContext';
import { createSecurityQuery } from '../firebase/queryBuilder';

interface UseFirebaseQueryOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  securityOptions?: {
    withFieldAccess?: string;
  };
  dependencies?: any[];
  enabled?: boolean;
}

interface UseFirebaseQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirebaseQuery<T = any>({
  collectionName,
  constraints = [],
  securityOptions,
  dependencies = [],
  enabled = true,
}: UseFirebaseQueryOptions): UseFirebaseQueryResult<T> {
  const { currentUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dependencyKey = useMemo(() => {
    if (!dependencies || dependencies.length === 0) return 'no-deps';
    return JSON.stringify(dependencies);
  }, dependencies);

  const constraintsKey = useMemo(() => JSON.stringify(constraints), [JSON.stringify(constraints)]);

  const memoizedConstraints = useMemo(() => constraints, [constraintsKey]);

  const securityConstraints = useMemo(() => {
    if (!currentUser || !enabled) return [];
    
    const queryBuilder = createSecurityQuery(currentUser);
    if (securityOptions?.withFieldAccess) {
      queryBuilder.withFieldAccess(securityOptions.withFieldAccess);
    }
    return queryBuilder.build();
  }, [currentUser, securityOptions?.withFieldAccess, enabled]);

  const cacheKey = useMemo(() => {
    return `${collectionName}-${currentUser?.organizationId}-${constraintsKey}-${dependencyKey}`;
  }, [collectionName, currentUser?.organizationId, constraintsKey, dependencyKey]);

  const executeQuery = useCallback(async () => {
    if (authLoading || !currentUser || !enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const finalQuery = query(
        collection(db, collectionName),
        ...securityConstraints,
        ...memoizedConstraints
      );

      
      const snapshot = await getDocs(finalQuery);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));

      setData(items);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [authLoading, currentUser, enabled, cacheKey, collectionName, securityConstraints, memoizedConstraints]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return { data, loading, error };
}
