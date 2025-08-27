// src/hooks/silobags/useSiloBag.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../shared/firebase/firebase';
import type { Silobag } from '../../../shared/types';

export const useSiloBag = (siloBagId?: string) => {
    const [siloBag, setSiloBag] = useState<Silobag | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!siloBagId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const docRef = doc(db, 'silo_bags', siloBagId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {

                    setSiloBag({ id: docSnap.id, ...docSnap.data() } as Silobag);
                } else {
                    setError(new Error("El silobolsa no fue encontrado."));
                    setSiloBag(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error en useSiloBag:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };

    }, [siloBagId]);

    return { siloBag, loading, error };
};