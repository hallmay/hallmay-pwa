import { arrayUnion, Timestamp } from "firebase/firestore";
import type { Campaign, CampaignField, Crop, Harvester, HarvestManager, HarvestSession, HarvestStatus, Plot, User } from "../../../shared/types";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";
import { FirebaseBatchOperation } from "../../../shared/services";

interface StartSessionParams {
    formData: {
        fieldId: string;
        plotId: string;
        cropId: string;
        hectares: number;
        estimatedYield: number;
        managerId: string;
        harvesters: { harvesterId: string; maps: boolean }[];
    };
    currentUser: User;
    activeCampaign: Partial<Campaign>;
    allPlots: Plot[];
    allCampaignFields: CampaignField[];
    allCrops: Crop[];
    allHarvestManagers: HarvestManager[];
    allHarvesters: Harvester[];
}

interface UpsertHarvestersParams {
    harvestSessionId: string;
    harvestersFormData: { id: string; name: string; plot_map: boolean; harvested_hectares: string | number }[];
}

/**
 * Servicio refactorizado para manejo de sesiones de cosecha
 * Utiliza la clase base BaseFirebaseService para operaciones comunes
 */
class HarvestSessionService extends FirebaseBatchOperation {
    private readonly COLLECTION_NAME = 'harvest_sessions';
    private readonly PLOTS_COLLECTION_NAME = 'plots';

    /**
     * Valida y obtiene los datos necesarios para iniciar una sesión
     */
    private validateAndGetSessionData(params: StartSessionParams) {
        const { formData, allPlots, allCampaignFields, allCrops, allHarvestManagers, allHarvesters } = params;

        const selectedField = allCampaignFields?.find(cf => cf.field.id === formData.fieldId)?.field;
        const selectedPlot = allPlots?.find(p => p.id === formData.plotId);
        const selectedCrop = allCrops?.find(c => c.id === formData.cropId);
        const selectedManager = allHarvestManagers?.find(m => m.id === formData.managerId);

        if (!selectedField || !selectedPlot || !selectedCrop || !selectedManager) {
            throw new Error("Faltan datos esenciales para iniciar la cosecha.");
        }

        const selectedHarvesters = formData.harvesters.map(h => {
            const harvesterData = allHarvesters?.find(harv => harv.id === h.harvesterId);
            if (!harvesterData) {
                throw new Error(`El cosechero con ID ${h.harvesterId} no fue encontrado.`);
            }
            return { 
                id: harvesterData.id, 
                name: harvesterData.name, 
                map_plot: h.maps, 
                harvested_hectares: 0 
            };
        });

        return {
            selectedField,
            selectedPlot,
            selectedCrop,
            selectedManager,
            selectedHarvesters
        };
    }

    /**
     * Construye el documento de sesión de cosecha
     */
    private buildHarvestSessionDocument(params: StartSessionParams, validatedData: any) {
        const { formData, currentUser, activeCampaign } = params;
        const { selectedField, selectedPlot, selectedCrop, selectedManager, selectedHarvesters } = validatedData;

        return {
            field: { id: selectedField.id, name: selectedField.name },
            plot: { id: selectedPlot.id, name: selectedPlot.name },
            crop: { id: selectedCrop.id, name: selectedCrop.name },
            harvest_manager: { id: selectedManager.id, name: selectedManager.name },
            harvesters: selectedHarvesters,
            hectares: formData.hectares,
            estimated_yield: formData.estimatedYield,
            campaign: { id: activeCampaign.id, name: activeCampaign.name },
            date: Timestamp.now(),
            organization_id: currentUser.organizationId,
            harvested_kgs: 0,
            status: 'pending' as HarvestStatus,
            harvested_hectares: 0,
            yields: { seed: 0, harvested: 0, real_vs_projected: 0 }
        };
    }

    private addHarvestSessionToPlot(params: StartSessionParams) {
        const {formData,activeCampaign} = params;

        this.updateDocument(this.PLOTS_COLLECTION_NAME,formData.plotId,{
            harvest_sessions: arrayUnion({campaign_id: activeCampaign.id, crop_id: formData.cropId})
        });
    }

    /**
     * Inicia una nueva sesión de cosecha
     */
    async startHarvestSession(params: StartSessionParams) {
        // Validar datos
        const validatedData = this.validateAndGetSessionData(params);
        
        // Construir documento
        const harvestPlotDocument = this.buildHarvestSessionDocument(params, validatedData);

        this.addHarvestSessionToPlot(params);
        
        // Crear documento con timestamps automáticos
        this.batchCreate(this.COLLECTION_NAME, harvestPlotDocument);

        await this.commitBatch();
    }

    /**
     * Actualiza el responsable de cosecha
     */
    async updateHarvestManager(harvestSessionId: string, newValue: HarvestManager) {
        this.validateRequiredFields({ harvestSessionId, newValue }, ['harvestSessionId', 'newValue']);
        
        await this.updateDocument(this.COLLECTION_NAME, harvestSessionId, {
            harvest_manager: newValue
        });
    }

    /**
     * Actualiza o inserta cosecheros
     */
    async upsertHarvesters(params: UpsertHarvestersParams) {
        this.validateRequiredFields(params, ['harvestSessionId', 'harvestersFormData']);
        
        const { harvestSessionId, harvestersFormData } = params;
        
        const updatedHarvesters = harvestersFormData.map(h => ({
            id: h.id,
            name: h.name,
            plot_map: h.plot_map || false,
            harvested_hectares: this.parseNumericValue(h.harvested_hectares)
        }));

        await this.updateDocument(this.COLLECTION_NAME, harvestSessionId, {
            harvesters: updatedHarvesters
        });
    }

    /**
     * Actualiza el progreso de una sesión de cosecha
     */
    async updateHarvestSessionProgress(
        currentSession: HarvestSession,
        newStatus: HarvestStatus,
        newHarvestedHectares: number
    ) {
        this.validateRequiredFields(
            { currentSession, newStatus, newHarvestedHectares }, 
            ['currentSession', 'newStatus', 'newHarvestedHectares']
        );

        // Calcular la sesión con nuevos rendimientos
        const sessionWithNewProgress = {
            ...currentSession,
            status: newStatus,
            harvested_hectares: newHarvestedHectares,
        };
        const finalSession = getSessionWithRecalculatedYields(sessionWithNewProgress);

        // Preparar payload de actualización
        const updatePayload: Record<string, unknown> = {
            status: finalSession.status,
            harvested_hectares: finalSession.harvested_hectares,
            yields: finalSession.yields,
        };

        // Si hay un solo cosechero, actualizar sus hectáreas cosechadas
        if (finalSession.harvesters && finalSession.harvesters.length === 1) {
            const singleHarvester = finalSession.harvesters[0];
            updatePayload.harvesters = [{
                ...singleHarvester,
                harvested_hectares: finalSession.harvested_hectares,
            }];
        }

        await this.updateDocument(this.COLLECTION_NAME, currentSession.id, updatePayload);
    }
}

// Crear instancia singleton del servicio
const harvestSessionService = new HarvestSessionService();

// Exportar funciones públicas manteniendo la misma API
export const startHarvestSession = (params: StartSessionParams) => 
    harvestSessionService.startHarvestSession(params);

export const updateHarvestManager = (harvestSessionId: string, newValue: HarvestManager) => 
    harvestSessionService.updateHarvestManager(harvestSessionId, newValue);

export const upsertHarvesters = (params: UpsertHarvestersParams) => 
    harvestSessionService.upsertHarvesters(params);

export const updateHarvestSessionProgress = (
    currentSession: HarvestSession,
    newStatus: HarvestStatus,
    newHarvestedHectares: number
) => harvestSessionService.updateHarvestSessionProgress(currentSession, newStatus, newHarvestedHectares);
