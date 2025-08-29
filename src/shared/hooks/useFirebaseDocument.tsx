import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import useAuth from '../context/auth/AuthContext';

interface UseFirebaseDocumentOptions {
  collectionName: string;
  documentId: string;
  enabled?: boolean;
  requireAuth?: boolean;
}

interface UseFirebaseDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (data: T | null) => void;
}

export function useFirebaseDocument<T = any>({
  collectionName,
  documentId,
  enabled = true,
}: UseFirebaseDocumentOptions): UseFirebaseDocumentResult<T> {
  const { currentUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar la referencia del documento para evitar re-renders
  const docRef = useMemo(() => {
    if (!documentId || !enabled) return null;
    return doc(db, collectionName, documentId);
  }, [collectionName, documentId, enabled]);

  useEffect(() => {
    if (authLoading || !currentUser || !enabled || !docRef || !documentId) {
      if (!authLoading) {
        setLoading(false);
        setData(null);
      }
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const documentData = { 
            id: docSnap.id, 
            ...docSnap.data() 
          } as T;
          setData(documentData);
        } else {
          console.warn(`Documento ${documentId} no existe en ${collectionName}`);
          setError(`El documento no fue encontrado.`);
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error en suscripción al documento ${documentId}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, currentUser, authLoading, enabled, documentId, collectionName]);

  return { data, loading, error, setData };
}
