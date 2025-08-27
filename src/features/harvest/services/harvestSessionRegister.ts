import { collection, doc, Timestamp, writeBatch, increment } from "firebase/firestore";
import type { Destination, HarvestSession, HarvestSessionRegister, Silobag } from "../../../shared/types";
import { db } from "../../../shared/firebase/firebase";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";
import { _prepareSiloBagCreation } from "../../silobags/services/siloBags";
import { queueOfflineWrite } from "../../../shared/services/offlineQueueManager";

// --- INTERFACES PARA LOS PARÁMETROS ---

interface AddRegisterParams {
    formData: any;
    harvestSession: HarvestSession;
    siloBags: Silobag[];
    destinations: Destination[];
}

interface UpdateRegisterParams {
    formData: any;
    originalRegister: HarvestSessionRegister;
    harvestSession: HarvestSession;
    siloBags: Silobag[];
    destinations: Destination[];
}

interface DeleteRegisterParams {
    registerToDelete: HarvestSessionRegister;
    harvestSession: HarvestSession;
}


// --- HELPERS: Funciones privadas y enfocadas ---

/**
 * Prepara la actualización para el documento HarvestSession.
 * @returns El payload para actualizar la sesión.
 */
const _buildSessionUpdate = (session: HarvestSession, kgChange: number): Partial<HarvestSession> => {
    const updatedSession = getSessionWithRecalculatedYields({
        ...session,
        harvested_kgs: (session.harvested_kgs || 0) + kgChange,
    });
    return {
        harvested_kgs: updatedSession.harvested_kgs,
        yields: updatedSession.yields,
        updated_at: Timestamp.now(),
    };
};

/**
 * Prepara las operaciones de batch para Silobags (crear o actualizar).
 */
const _buildSiloBagOperations = (batch: any, params: AddRegisterParams | UpdateRegisterParams, registerRef: any, kgChange: number) => {
    const { formData, harvestSession } = params;
    if (formData.type !== 'silo_bag') return null;

    let siloBagForRegister: { id: string, name: string, location?: string };

    if ('originalRegister' in params) { // Es una actualización
        const { originalRegister } = params;
        siloBagForRegister = { id: originalRegister.silo_bag.id, name: originalRegister.silo_bag.name, location: formData.location };
        const siloRef = doc(db, 'silo_bags', originalRegister.silo_bag.id);
        const movementRef = doc(db, `silo_bags/${originalRegister.silo_bag.id}/movements`, originalRegister.id);
        batch.update(siloRef, { current_kg: increment(kgChange), updated_at: Timestamp.now() });
        batch.update(movementRef, { kg_change: parseFloat(formData.weight_kg), date: Timestamp.now() });
    } else { // Es una creación
        const { siloBags } = params;
        if (!formData.siloBagId) { // Crear nuevo
            const siloBagData = {
                name: formData.newSiloBagName, initial_kg: kgChange,
                organization_id: harvestSession.organization_id, crop: harvestSession.crop,
                field: harvestSession.field, location: formData.location
            } as Partial<Silobag>;
            const newSiloBagRef = _prepareSiloBagCreation(batch, siloBagData, 'harvest_entry', registerRef.id);
            siloBagForRegister = { id: newSiloBagRef.id, name: formData.newSiloBagName, location: formData.location };
        } else { // Usar existente
            const silobag = siloBags.find(s => s.id === formData.siloBagId);
            if (!silobag) throw new Error("El silobolsa seleccionado no existe.");
            siloBagForRegister = { id: silobag.id, name: silobag.name, location: silobag.location };
            const siloRef = doc(db, 'silo_bags', silobag.id);
            const movementRef = doc(collection(db, `silo_bags/${silobag.id}/movements`), registerRef.id);
            batch.update(siloRef, { current_kg: increment(kgChange) });
            batch.set(movementRef, { type: 'harvest_entry', kg_change: kgChange, date: Timestamp.now(), organization_id: formData.organization_id, field: { id: harvestSession.field.id }, details: "Entrada por cosecha." });
        }
    }
    return siloBagForRegister;
};

/**
 * Construye el objeto de datos para el documento de registro.
 */
const _buildRegisterDocument = (params: AddRegisterParams | UpdateRegisterParams, siloBagForRegister: any) => {
    const { formData, harvestSession, destinations } = params;
    const destination = formData.type === 'truck' ? destinations.find(d => d.id === formData.destinationId) : undefined;

    return {
        organization_id: harvestSession.organization_id,
        field: { id: harvestSession.field.id },
        date: Timestamp.now(),
        humidity: parseFloat(formData.humidity),
        weight_kg: parseFloat(formData.weight_kg),
        type: formData.type,
        details: formData.observations,
        ...(formData.type === 'truck' ? {
            truck: { driver: formData.driver, license_plate: formData.license_plate },
            destination: { id: destination.id, name: destination.name },
            ctg: formData.ctg || null,
            cpe: formData.cpe || null
        } : {
            silo_bag: siloBagForRegister
        })
    };
};


// --- FUNCIONES PÚBLICAS: Orquestadores ---

export const addRegister = async (params: AddRegisterParams) => {
    const { harvestSession, formData } = params;
    const batch = writeBatch(db);
    const weightKg = parseFloat(formData.weight_kg);

    // 1. Preparar actualización de la sesión
    const sessionUpdate = _buildSessionUpdate(harvestSession, weightKg);
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, sessionUpdate);

    // 2. Preparar operaciones de Silobag
    const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));
    const siloBagForRegister = _buildSiloBagOperations(batch, params, registerRef, weightKg);

    // 3. Preparar el documento de registro
    const registerData = _buildRegisterDocument(params, siloBagForRegister);
    batch.set(registerRef, registerData);

    // 4. Ejecutar y manejar offline
    try {
        await batch.commit();
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('addRegister', [params]);
        } else {
            throw error;
        }
    }
};

export const updateRegister = async (params: UpdateRegisterParams) => {
    const { originalRegister, harvestSession, formData } = params;
    const batch = writeBatch(db);
    const kgDifference = parseFloat(formData.weight_kg) - (originalRegister.weight_kg || 0);

    // 1. Preparar actualización de la sesión
    const sessionUpdate = _buildSessionUpdate(harvestSession, kgDifference);
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, sessionUpdate);

    // 2. Preparar operaciones de Silobag
    const registerRef = doc(db, `harvest_sessions/${harvestSession.id}/registers`, originalRegister.id);
    const siloBagForRegister = _buildSiloBagOperations(batch, params, registerRef, kgDifference);

    // 3. Preparar el documento de registro
    const registerData = _buildRegisterDocument(params, siloBagForRegister);
    batch.update(registerRef, registerData);

    // 4. Ejecutar y manejar offline
    try {
        await batch.commit();
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('updateRegister', [params]);

        } else {

            throw error;
        }
    }
};

export const deleteRegister = async (params: DeleteRegisterParams) => {
    const { registerToDelete, harvestSession } = params;
    if (!registerToDelete.id) return;
    const batch = writeBatch(db);
    const weightKg = registerToDelete.weight_kg || 0;

    // 1. Preparar actualización de la sesión (con kgs en negativo)
    const sessionUpdate = _buildSessionUpdate(harvestSession, -weightKg);
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, sessionUpdate);

    // 2. Preparar eliminación del registro y operaciones de Silobag
    const registerRef = doc(db, `harvest_sessions/${harvestSession.id}/registers`, registerToDelete.id);
    batch.delete(registerRef);

    if (registerToDelete.type === 'silo_bag' && registerToDelete.silo_bag?.id) {
        const siloRef = doc(db, 'silo_bags', registerToDelete.silo_bag.id);
        const movementRef = doc(db, `silo_bags/${registerToDelete.silo_bag.id}/movements`, registerToDelete.id);
        batch.update(siloRef, { current_kg: increment(-weightKg) });
        batch.delete(movementRef);
    }

    // 3. Ejecutar y manejar offline
    try {
        await batch.commit();
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('deleteRegister', [params]);
        } else {
            throw error;
        }
    }
};