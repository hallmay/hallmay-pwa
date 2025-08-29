import { collection, doc, increment, Timestamp, WriteBatch, writeBatch } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { db } from "../../../shared/firebase/firebase";
import type { CampaignField, Crop, Silobag, MovementType, SilobagMovement, User } from "../../../shared/types";
import { queueOfflineWrite } from "../../../shared/services/offlineQueueManager";

interface CreateSiloBagParams {
    formData: {
        name: string;
        fieldId: string;
        cropId: string;
        initialKg: string;
        details?: string;
        location?: string;
    };
    currentUser: User;
    fields: Partial<CampaignField>[];
    crops: Partial<Crop>[];
}

interface ExtractKgsParams {
    siloBag: Silobag;
    formData: {
        kgChange: string;
        details: string;
    };
    currentUser: User;
}

interface CloseSiloBagParams {
    siloBag: Silobag;
    formData: {
        reason: string;
        details: string;
    };
}

// --- LÓGICA DE SERVICIO ---

export const _prepareSiloBagCreation = (
    batch: WriteBatch,
    siloBagData: Partial<Silobag>,
    movementType: MovementType = 'creation',
    movementId?: string
) => {
    const siloBagRef = doc(collection(db, "silo_bags"));
    const movementRef = movementId ?
        doc(db, `silo_bags/${siloBagRef.id}/movements`, movementId) :
        doc(collection(db, `silo_bags/${siloBagRef.id}/movements`));

    const siloBagDocument = {
        ...siloBagData,
        created_at: Timestamp.fromDate(new Date()),
        current_kg: siloBagData.initial_kg,
        status: "active",
    };

    const initialMovementData: Partial<SilobagMovement> = {
        type: movementType,
        organization_id: siloBagData.organization_id,
        field: { id: siloBagData?.field?.id },
        kg_change: siloBagData.initial_kg,
        date: Timestamp.now(),
        created_at: Timestamp.now(),
        details: movementType === 'creation' ? "Creación manual de silobolsa." : "Entrada inicial por cosecha."
    };

    batch.set(siloBagRef, siloBagDocument);
    batch.set(movementRef, initialMovementData);

    return siloBagRef;
};

export const createSilobag = async (params: CreateSiloBagParams) => {
    const { formData, currentUser, fields, crops } = params;

    const field = fields.find(cf => cf.field?.id === formData.fieldId)?.field;
    const crop = crops.find(c => c.id === formData.cropId);

    if (!field || !crop) {
        toast.error("El campo o el cultivo seleccionado no son válidos.");
        throw new Error("El campo o el cultivo seleccionado no son válidos.");
    }

    const siloBagData: Partial<Silobag> = {
        name: formData.name,
        location: formData.location,
        organization_id: currentUser.organizationId,
        initial_kg: parseFloat(formData.initialKg),
        field: { id: field.id, name: field.name },
        crop: { id: crop.id, name: crop.name },
        details: formData.details
    };

    const batch = writeBatch(db);
    _prepareSiloBagCreation(batch, siloBagData, 'creation');

    try {
        await batch.commit();
    } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'unavailable' || !navigator.onLine) {
            console.warn("Modo offline detectado. Guardando 'createSilobag' en la cola.");
            await queueOfflineWrite('createSilobag', [params]);
        } else {
            console.error("Error al crear el silo:", error);
            throw error;
        }
    }
};

export const extractKgsSilobag = async (params: ExtractKgsParams) => {
    const { siloBag, formData, currentUser } = params;

    const exitMovement: Omit<SilobagMovement, 'id'> = {
        type: "substract",
        field: { id: siloBag.field.id },
        kg_change: -parseFloat(formData.kgChange),
        organization_id: currentUser.organizationId,
        date: Timestamp.now(),
        created_at: Timestamp.now(),
        details: formData.details
    };

    const batch = writeBatch(db);
    const siloBagRef = doc(db, 'silo_bags', siloBag.id);
    const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));

    batch.update(siloBagRef, { current_kg: increment(exitMovement.kg_change), updated_at: Timestamp.now() });
    batch.set(movementRef, exitMovement);

    try {
        await batch.commit();
    } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'unavailable' || !navigator.onLine) {
            console.warn("Modo offline detectado. Guardando 'extractKgsSilobag' en la cola.");
            await queueOfflineWrite('extractKgsSilobag', [params]);
        } else {
            console.error("Error al registrar extracción:", error);
            throw error;
        }
    }
};

export const closeSilobag = async (params: CloseSiloBagParams) => {
    const { siloBag, formData } = params;
    const batch = writeBatch(db);
    const siloBagRef = doc(db, `silo_bags/${siloBag.id}`);

    const dataToUpdate = {
        status: 'closed',
        current_kg: 0,
        difference_kg: siloBag.current_kg
    };

    const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));
    const adjustmentMovement: Partial<SilobagMovement> = {
        organization_id: siloBag.organization_id,
        type: "close",
        field: { id: siloBag.field.id },
        kg_change: siloBag.current_kg,
        date: Timestamp.now(),
        created_at: Timestamp.now(),
        details: `Cierre de silo. Motivo: ${formData.details}`
    };
    batch.set(movementRef, adjustmentMovement);

    batch.update(siloBagRef, dataToUpdate);

    try {
        await batch.commit();
    } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'unavailable' || !navigator.onLine) {
            console.warn("Modo offline detectado. Guardando 'closeSilobag' en la cola.");
            await queueOfflineWrite('closeSilobag', [params]);
        } else {
            console.error("Error al cerrar el silo:", error);
            throw error;
        }
    }
};