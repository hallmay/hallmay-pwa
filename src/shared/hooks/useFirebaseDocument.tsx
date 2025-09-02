import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, getDocFromCache, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import useAuth from '../context/auth/AuthContext';

interface UseFirebaseDocumentOptions {
  collectionName: string;
  documentId: string | null | undefined;
  dependencies?: any[];
  enabled?: boolean;
  source?: 'default' | 'cache-first' | 'server-first' | 'cache-only';
  realtime?: boolean;
}

interface UseFirebaseDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  realtime?: boolean;
}

export function useFirebaseDocument<T = any>({
  collectionName,
  documentId,
  dependencies = [],
  enabled = true,
  source = 'cache-first',
  realtime = false // Default: cache-first, no realtime
}: UseFirebaseDocumentOptions): UseFirebaseDocumentResult<T> {
  const { currentUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dependencyKey = useMemo(() => {
    if (!dependencies || dependencies.length === 0) return 'no-deps';
    return JSON.stringify(dependencies);
  }, dependencies);


  const executeQuery = async () => {
    if (authLoading || !currentUser || !enabled || !documentId) {
      setLoading(false);
      if (!documentId) {
        setData(null);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      let docSnap;
      
      if (source === 'cache-first' || source === 'cache-only') {
        try {
          docSnap = await getDocFromCache(docRef);
          
          if (!docSnap.exists()) {
            docSnap = await getDocFromServer(docRef);
          }
        } catch (cacheError) {
          if (source === 'cache-only') {
            throw new Error('No document available offline');
          }
          docSnap = await getDocFromServer(docRef);
        }
      } else if (source === 'server-first') {
        try {
          docSnap = await getDocFromServer(docRef);
        } catch (serverError) {
          docSnap = await getDocFromCache(docRef);
        }
      } else {
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        const docData = {
          id: docSnap.id,
          ...docSnap.data()
        } as T;

        setData(docData);
      } else {
        setData(null);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const refetch = async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      
      const docSnap = await getDocFromServer(docRef);
      
      if (docSnap.exists()) {
        const docData = {
          id: docSnap.id,
          ...docSnap.data()
        } as T;

        setData(docData);

      } else {
        setData(null);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (realtime) {
      if (authLoading || !currentUser || !enabled || !documentId) {
        setLoading(false);
        if (!documentId) {
          setData(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      
      const unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const docData = {
              id: docSnap.id,
              ...docSnap.data()
            } as T;
            setData(docData);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`❌ Error en realtime document ${collectionName}/${documentId}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      executeQuery();
    }
  }, [currentUser, enabled, documentId, dependencyKey, authLoading, realtime]);

  return { data, loading, error, refetch };
}
