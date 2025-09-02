import { Timestamp } from "firebase/firestore";
import type { Destination, HarvestSession, HarvestSessionRegister, Silobag } from "../../../shared/types";
import { FirebaseBatchOperation } from "../../../shared/services/FirebaseBatchOperation";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";

interface RegisterFormData {
    type: string;
    weight_kg: string;
    humidity: string;
    driver?: string;
    license_plate?: string;
    destinationId?: string;
    ctg?: string;
    cpe?: string;
    siloBagId?: string;
    newSiloBagName?: string;
    location?: string;
    observations?: string;
}

interface AddRegisterParams {
    formData: RegisterFormData;
    harvestSession: HarvestSession;
    siloBags: Silobag[];
    destinations: Destination[];
}

interface UpdateRegisterParams extends AddRegisterParams {
    originalRegister: HarvestSessionRegister;
}

interface DeleteRegisterParams {
    registerToDelete: HarvestSessionRegister;
    harvestSession: HarvestSession;
}

/**
 * Servicio simplificado para manejo de registros de cosecha
 * Separa claramente las operaciones por tipo: truck vs silo_bag
 */
class HarvestSessionRegisterService extends FirebaseBatchOperation {
    private readonly SESSION_COLLECTION = 'harvest_sessions';
    private readonly SILOBAG_COLLECTION = 'silo_bags';
    private readonly REGISTERS_SUBCOLLECTION = 'registers';
    private readonly MOVEMENTS_SUBCOLLECTION = 'movements';

    /**
     * Actualiza la sesión de cosecha con los nuevos kilos
     */
    private updateHarvestSession(harvestSession: HarvestSession, kgChange: number): void {
        const updatedSession = getSessionWithRecalculatedYields({
            ...harvestSession,
            harvested_kgs: (harvestSession.harvested_kgs || 0) + kgChange,
        });
        
        this.batchUpdate(this.SESSION_COLLECTION, harvestSession.id, {
            harvested_kgs: updatedSession.harvested_kgs,
            yields: updatedSession.yields,
        });
    }

    /**
     * Crea un registro base con datos comunes
     */
    private buildBaseRegister(formData: RegisterFormData, harvestSession: HarvestSession) {
        return {
            organization_id: harvestSession.organization_id,
            field: { id: harvestSession.field.id },
            date: Timestamp.now(),
            humidity: this.parseNumericValue(formData.humidity),
            weight_kg: this.parseNumericValue(formData.weight_kg),
            type: formData.type,
            details: formData.observations,
        };
    }

    /**
     * Maneja registros tipo TRUCK - más simple
     */
    private handleTruckRegister(
        formData: RegisterFormData, 
        harvestSession: HarvestSession, 
        destinations: Destination[],
        registerId: string
    ) {
        const destination = destinations.find(d => d.id === formData.destinationId);
        if (!destination) {
            throw new Error("Destino no encontrado");
        }

        const registerData = {
            ...this.buildBaseRegister(formData, harvestSession),
            truck: {
                driver: formData.driver,
                license_plate: formData.license_plate,
                ctg: formData.ctg || null,
                cpe: formData.cpe || null
            },
            destination: { id: destination.id, name: destination.name }
        };

        this.batchCreate(
            `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
            registerData,
            registerId
        );
    }

    /**
     * Actualiza un silobag existente cuando se edita un registro
     */
    private updateExistingSiloBagRegister(
        formData: RegisterFormData,
        harvestSession: HarvestSession,
        registerId: string,
        originalRegister: HarvestSessionRegister
    ) {
        const weightKg = this.parseNumericValue(formData.weight_kg);
        const kgDifference = weightKg - (originalRegister.weight_kg || 0);

        const siloBagInfo = {
            id: originalRegister.silo_bag!.id,
            name: originalRegister.silo_bag!.name,
            location: formData.location
        };

        // Actualizar peso del silobag con la diferencia
        if (originalRegister.silo_bag?.id) {
            this.batchIncrement(this.SILOBAG_COLLECTION, originalRegister.silo_bag.id, 'current_kg', kgDifference);
        }

        // Actualizar movimiento existente
        if (originalRegister.silo_bag?.id) {
            this.batchUpdate(
                `${this.SILOBAG_COLLECTION}/${originalRegister.silo_bag.id}/${this.MOVEMENTS_SUBCOLLECTION}`,
                registerId,
                {
                    kg_change: weightKg,
                    date: Timestamp.now()
                }
            );
        }

        // Actualizar el registro principal
        this.batchUpdate(
            `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
            registerId,
            {
                ...this.buildBaseRegister(formData, harvestSession),
                silo_bag: siloBagInfo
            }
        );
    }

    /**
     * Crea un nuevo registro usando un silobag existente
     */
    private addRegisterToExistingSiloBag(
        formData: RegisterFormData,
        harvestSession: HarvestSession,
        siloBags: Silobag[],
        registerId: string
    ) {
        const weightKg = this.parseNumericValue(formData.weight_kg);
        const existingSiloBag = siloBags.find(s => s.id === formData.siloBagId);
        
        if (!existingSiloBag) {
            throw new Error("El silobolsa seleccionado no existe.");
        }

        const siloBagInfo = {
            id: existingSiloBag.id,
            name: existingSiloBag.name,
            location: existingSiloBag.location
        };

        // Incrementar peso del silobag
        this.batchIncrement(this.SILOBAG_COLLECTION, siloBagInfo.id, 'current_kg', weightKg);

        // Crear movimiento de entrada
        this.batchCreate(
            `${this.SILOBAG_COLLECTION}/${siloBagInfo.id}/${this.MOVEMENTS_SUBCOLLECTION}`,
            {
                type: 'harvest_entry',
                kg_change: weightKg,
                date: Timestamp.now(),
                organization_id: harvestSession.organization_id,
                field: { id: harvestSession.field.id },
                details: "Entrada por cosecha."
            },
            registerId
        );

        // Crear el registro principal
        this.batchCreate(
            `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
            {
                ...this.buildBaseRegister(formData, harvestSession),
                silo_bag: siloBagInfo
            },
            registerId
        );
    }

    /**
     * Crea un nuevo registro con un nuevo silobag
     */
    private addRegisterWithNewSiloBag(
        formData: RegisterFormData,
        harvestSession: HarvestSession,
        registerId: string
    ) {
        if (!formData.newSiloBagName) {
            throw new Error("Nombre del nuevo silobolsa es requerido");
        }

        const weightKg = this.parseNumericValue(formData.weight_kg);
        const newSiloBagRef = this.getDocumentReference(this.SILOBAG_COLLECTION);
        
        const siloBagInfo = {
            id: newSiloBagRef.id,
            name: formData.newSiloBagName,
            location: formData.location
        };

        // Crear el nuevo silobag
        this.batchCreate(this.SILOBAG_COLLECTION, {
            name: formData.newSiloBagName,
            location: formData.location,
            organization_id: harvestSession.organization_id,
            crop: harvestSession.crop,
            field: harvestSession.field,
            initial_kg: weightKg,
            current_kg: weightKg,
            status: "active",
            date: Timestamp.now(),
        }, newSiloBagRef.id);

        // Crear movimiento inicial
        this.batchCreate(
            `${this.SILOBAG_COLLECTION}/${newSiloBagRef.id}/${this.MOVEMENTS_SUBCOLLECTION}`,
            {
                type: 'harvest_entry',
                kg_change: weightKg,
                date: Timestamp.now(),
                organization_id: harvestSession.organization_id,
                field: { id: harvestSession.field.id },
                details: "Entrada inicial por cosecha."
            },
            registerId
        );

        // Crear el registro principal
        this.batchCreate(
            `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
            {
                ...this.buildBaseRegister(formData, harvestSession),
                silo_bag: siloBagInfo
            },
            registerId
        );
    }

    /**
     * Maneja creación de registros tipo SILO_BAG
     */
    private addSiloBagRegister(
        formData: RegisterFormData,
        harvestSession: HarvestSession,
        siloBags: Silobag[],
        registerId: string
    ) {
        if (formData.siloBagId) {
            // Usar silobag existente
            this.addRegisterToExistingSiloBag(formData, harvestSession, siloBags, registerId);
        } else {
            // Crear nuevo silobag
            this.addRegisterWithNewSiloBag(formData, harvestSession, registerId);
        }
    }

    /**
     * Maneja actualización de registros tipo SILO_BAG
     */
    private updateSiloBagRegister(
        formData: RegisterFormData,
        harvestSession: HarvestSession,
        registerId: string,
        originalRegister: HarvestSessionRegister
    ) {
        // Solo actualizar el silobag existente - no permitir cambio de silobag
        this.updateExistingSiloBagRegister(formData, harvestSession, registerId, originalRegister);
    }

    /**
     * Agrega un nuevo registro - lógica simplificada
     */
    async addRegister(params: AddRegisterParams): Promise<void> {
        this.validateRequiredFields(params, ['formData', 'harvestSession', 'siloBags', 'destinations']);
        
        const { formData, harvestSession, siloBags, destinations } = params;
        const weightKg = this.parseNumericValue(formData.weight_kg);

        this.resetBatch();

        // 1. Actualizar sesión primero
        this.updateHarvestSession(harvestSession, weightKg);

        // 2. Crear ID para el registro
        const registerRef = this.getSubcollectionRef(
            this.SESSION_COLLECTION,
            harvestSession.id,
            this.REGISTERS_SUBCOLLECTION
        );

        // 3. Manejar según tipo - separado y claro
        if (formData.type === 'truck') {
            this.handleTruckRegister(formData, harvestSession, destinations, registerRef.id);
        } else if (formData.type === 'silo_bag') {
            this.addSiloBagRegister(formData, harvestSession, siloBags, registerRef.id);
        } else {
            throw new Error(`Tipo de registro no soportado: ${formData.type}`);
        }

        // 4. Ejecutar todo el batch
        await this.commitBatch();
    }

    /**
     * Actualiza un registro existente - lógica simplificada
     */
    async updateRegister(params: UpdateRegisterParams): Promise<void> {
        this.validateRequiredFields(params, ['formData', 'harvestSession', 'siloBags', 'destinations', 'originalRegister']);
        
        const { formData, harvestSession, destinations, originalRegister } = params;
        const newWeight = this.parseNumericValue(formData.weight_kg);
        const kgDifference = newWeight - (originalRegister.weight_kg || 0);

        this.resetBatch();

        // 1. Actualizar sesión con la diferencia
        this.updateHarvestSession(harvestSession, kgDifference);

        // 2. Manejar según tipo - separado y claro
        if (formData.type === 'truck') {
            // Para trucks, solo actualizar el registro
            const destination = destinations.find(d => d.id === formData.destinationId);
            if (!destination) {
                throw new Error("Destino no encontrado");
            }

            this.batchUpdate(
                `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
                originalRegister.id,
                {
                    ...this.buildBaseRegister(formData, harvestSession),
                    truck: {
                        driver: formData.driver,
                        license_plate: formData.license_plate,
                        ctg: formData.ctg || null,
                        cpe: formData.cpe || null
                    },
                    destination: { id: destination.id, name: destination.name }
                }
            );

        } else if (formData.type === 'silo_bag') {
            this.updateSiloBagRegister(formData, harvestSession, originalRegister.id, originalRegister);
        }

        // 3. Ejecutar batch
        await this.commitBatch();
    }

    /**
     * Elimina un registro - lógica simplificada
     */
    async deleteRegister(params: DeleteRegisterParams): Promise<void> {
        this.validateRequiredFields(params, ['registerToDelete', 'harvestSession']);
        
        const { registerToDelete, harvestSession } = params;
        if (!registerToDelete.id) return;

        const weightKg = registerToDelete.weight_kg || 0;

        this.resetBatch();

        // 1. Actualizar sesión (restar kilos)
        this.updateHarvestSession(harvestSession, -weightKg);

        // 2. Eliminar registro principal
        this.batchDelete(
            `${this.SESSION_COLLECTION}/${harvestSession.id}/${this.REGISTERS_SUBCOLLECTION}`,
            registerToDelete.id
        );

        // 3. Si es silobag, limpiar operaciones relacionadas
        if (registerToDelete.type === 'silo_bag' && registerToDelete.silo_bag?.id) {
            const siloBagId = registerToDelete.silo_bag.id;
            
            // Restar peso del silobag
            this.batchIncrement(this.SILOBAG_COLLECTION, siloBagId, 'current_kg', -weightKg);
            
            // Eliminar movimiento
            this.batchDelete(
                `${this.SILOBAG_COLLECTION}/${siloBagId}/${this.MOVEMENTS_SUBCOLLECTION}`,
                registerToDelete.id
            );
        }

        // 4. Ejecutar batch
        await this.commitBatch();
    }
}

// Crear instancia singleton del servicio
const harvestSessionRegisterService = new HarvestSessionRegisterService();

// Exportar funciones públicas manteniendo la misma API
export const addRegister = (params: AddRegisterParams) => 
    harvestSessionRegisterService.addRegister(params);

export const updateRegister = (params: UpdateRegisterParams) => 
    harvestSessionRegisterService.updateRegister(params);

export const deleteRegister = (params: DeleteRegisterParams) => 
    harvestSessionRegisterService.deleteRegister(params);
