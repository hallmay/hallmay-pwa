import { collection, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import type { Logistics } from "../../../shared/types";
import { queueOfflineWrite } from "../../../shared/services/offlineQueueManager";

/**
 * Crea una nueva orden de logística.
 * Si está offline, guarda la operación para sincronizarla en segundo plano.
 * @param data Los datos de la nueva orden de logística.
 */
export const addLogisticsOrder = async (data: Partial<Logistics>) => {
    try {
        const logisticsCollection = collection(db, 'logistics');
        await addDoc(logisticsCollection, {
            ...data,
            status: 'in-route-to-field',
            created_at: Timestamp.now()
        });
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('addLogisticsOrder', [data]);
        } else {
            throw error;
        }
    }
};

/**
 * Actualiza el estado de una orden de logística.
 * Si está offline, guarda la operación para sincronizarla en segundo plano.
 * @param id El ID del documento de logística.
 * @param newStatus El nuevo estado.
 */
export const updateLogisticsStatus = async (id: string, newStatus: string) => {
    try {
        const logisticsDoc = doc(db, 'logistics', id);
        await updateDoc(logisticsDoc, {
            status: newStatus,
            updated_at: Timestamp.now()
        });

    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('updateLogisticsStatus', [id, newStatus]);

        } else {
            throw error;
        }
    }
};