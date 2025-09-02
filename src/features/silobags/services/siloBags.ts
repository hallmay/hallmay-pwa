import { toast } from "react-hot-toast";
import type { CampaignField, Crop, Silobag, MovementType, User } from "../../../shared/types";
import { FirebaseBatchOperation } from "../../../shared/services/FirebaseBatchOperation";
import { Timestamp } from "firebase/firestore";

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

/**
 * Servicio simplificado para manejo de silobags
 * Separa claramente las operaciones y elimina lógica compleja
 */
class SiloBagService extends FirebaseBatchOperation {
    private readonly COLLECTION_NAME = 'silo_bags';
    private readonly MOVEMENTS_SUBCOLLECTION = 'movements';

    /**
     * Encuentra y valida campo y cultivo
     */
    private findFieldAndCrop(fieldId: string, cropId: string, fields: Partial<CampaignField>[], crops: Partial<Crop>[]) {
        const field = fields.find(cf => cf.field?.id === fieldId)?.field;
        const crop = crops.find(c => c.id === cropId);

        if (!field || !crop) {
            const error = "El campo o el cultivo seleccionado no son válidos.";
            toast.error(error);
            throw new Error(error);
        }

        return { field, crop };
    }

    /**
     * Crea un movimiento estándar
     */
    private createMovement(
        siloBagId: string,
        movementData: {
            type: MovementType;
            kg_change: number;
            organization_id: string;
            field_id: string;
            details: string;
        },
        movementId?: string
    ) {
        const movementDoc = {
            type: movementData.type,
            date: Timestamp.now(),
            organization_id: movementData.organization_id,
            field: { id: movementData.field_id },
            kg_change: movementData.kg_change,
            details: movementData.details
        };

        const collectionPath = `${this.COLLECTION_NAME}/${siloBagId}/${this.MOVEMENTS_SUBCOLLECTION}`;
        
        if (movementId) {
            this.batchCreate(collectionPath, movementDoc, movementId);
        } else {
            const movementRef = this.getSubcollectionRef(this.COLLECTION_NAME, siloBagId, this.MOVEMENTS_SUBCOLLECTION);
            this.batchCreate(collectionPath, movementDoc, movementRef.id);
        }
    }

    /**
     * Crea un nuevo silobag - versión simplificada
     */
    async createSilobag(params: CreateSiloBagParams): Promise<void> {
        this.validateRequiredFields(params, ['formData', 'currentUser', 'fields', 'crops']);
        
        const { formData, currentUser, fields, crops } = params;

        // 1. Validar referencias
        const { field, crop } = this.findFieldAndCrop(formData.fieldId, formData.cropId, fields, crops);
        const initialKg = this.parseNumericValue(formData.initialKg);

        this.resetBatch();

        // 2. Crear silobag
        const siloBagRef = this.getDocumentReference(this.COLLECTION_NAME);
        
        this.batchCreate(this.COLLECTION_NAME, {
            name: formData.name,
            location: formData.location,
            date: Timestamp.now(),
            organization_id: currentUser.organizationId,
            initial_kg: initialKg,
            current_kg: initialKg,
            field: { id: field.id, name: field.name },
            crop: { id: crop.id, name: crop.name },
            details: formData.details,
            status: "active"
        }, siloBagRef.id);

        // 3. Crear movimiento inicial
        this.createMovement(siloBagRef.id, {
            type: 'creation',
            kg_change: initialKg,
            organization_id: currentUser.organizationId,
            field_id: field.id!,
            details: "Creación manual de silobolsa."
        });

        // 4. Ejecutar
        await this.commitBatch();
    }

    /**
     * Extrae kilogramos de un silobag - versión simplificada
     */
    async extractKgsSilobag(params: ExtractKgsParams): Promise<void> {
        this.validateRequiredFields(params, ['siloBag', 'formData', 'currentUser']);
        
        const { siloBag, formData, currentUser } = params;
        const extractKg = this.parseNumericValue(formData.kgChange);

        this.resetBatch();

        // 1. Actualizar peso del silobag (restar)
        this.batchIncrement(this.COLLECTION_NAME, siloBag.id, 'current_kg', -extractKg);

        // 2. Crear movimiento de extracción
        this.createMovement(siloBag.id, {
            type: "substract",
            kg_change: -extractKg,
            organization_id: currentUser.organizationId,
            field_id: siloBag.field.id,
            details: formData.details
        });

        // 3. Ejecutar
        await this.commitBatch();
    }

    /**
     * Cierra un silobag - versión simplificada
     */
    async closeSilobag(params: CloseSiloBagParams): Promise<void> {
        this.validateRequiredFields(params, ['siloBag', 'formData']);
        
        const { siloBag, formData } = params;

        this.resetBatch();

        // 1. Cerrar silobag y registrar diferencia
        this.batchUpdate(this.COLLECTION_NAME, siloBag.id, {
            status: 'closed',
            current_kg: 0,
            difference_kg: siloBag.current_kg
        });

        // 2. Crear movimiento de cierre
        this.createMovement(siloBag.id, {
            type: "close",
            kg_change: siloBag.current_kg,
            organization_id: siloBag.organization_id,
            field_id: siloBag.field.id,
            details: `Cierre de silo. Motivo: ${formData.details}`
        });

        // 3. Ejecutar
        await this.commitBatch();
    }
}

// Crear instancia singleton del servicio
const siloBagService = new SiloBagService();

// Exportar funciones públicas manteniendo la misma API
export const createSilobag = (params: CreateSiloBagParams) => 
    siloBagService.createSilobag(params);

export const extractKgsSilobag = (params: ExtractKgsParams) => 
    siloBagService.extractKgsSilobag(params);

export const closeSilobag = (params: CloseSiloBagParams) => 
    siloBagService.closeSilobag(params);
