import { useState, useEffect } from 'react';
import useAuth from '../../../shared/context/auth/AuthContext';
import type { HarvestSession } from '../../../shared/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/firebase/firebase';

export const useHarvestSession = (harvestSessionId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [session, setSession] = useState<HarvestSession | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !harvestSessionId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        const docRef = doc(db, 'harvest_sessions', harvestSessionId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const harvestSessionData = { id: docSnap.id, ...docSnap.data() };
                    setSession(harvestSessionData as HarvestSession);
                } else {
                    console.error("La sesión de cosecha no existe.");
                    setError("La sesión de cosecha no fue encontrada.");
                }
                setLoading(false);
            },
            (error) => {
                // Manejamos errores de permisos o de red.
                console.error("Error en la suscripción a la sesión:", error);
                setError(error.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza.
        return () => {
            unsubscribe();
        };


    }, [currentUser, authLoading, harvestSessionId]);

    // 3. El hook devuelve el estado.
    return { session, loading, error, setSession };
};