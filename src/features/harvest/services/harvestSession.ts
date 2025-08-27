import { doc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import type { Campaign, CampaignField, Crop, Harvester, HarvestManager, HarvestSession, HarvestStatus, Plot, User } from "../../../shared/types";
import { db } from "../../../shared/firebase/firebase";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";
import { queueOfflineWrite } from "../../../shared/services/offlineQueueManager";

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

// --- LÓGICA DE SERVICIO ---

export const startHarvestSession = async (params: StartSessionParams) => {
    const { formData, currentUser, activeCampaign, allPlots, allCampaignFields, allCrops, allHarvestManagers, allHarvesters } = params;

    const selectedField = allCampaignFields?.find(cf => cf.field.id === formData.fieldId)?.field;
    const selectedPlot = allPlots?.find(p => p.id === formData.plotId);
    const selectedCrop = allCrops?.find(c => c.id === formData.cropId);
    const selectedManager = allHarvestManagers?.find(m => m.id === formData.managerId);

    const selectedHarvesters = formData.harvesters.map(h => {
        const harvesterData = allHarvesters?.find(harv => harv.id === h.harvesterId);
        if (!harvesterData) throw new Error(`El cosechero con ID ${h.harvesterId} no fue encontrado.`);
        return { id: harvesterData.id, name: harvesterData.name, map_plot: h.maps, harvested_hectares: 0 };
    });

    if (!selectedField || !selectedPlot || !selectedCrop || !selectedManager) {
        throw new Error("Faltan datos esenciales para iniciar la cosecha.");
    }

    const harvestPlotDocument = {
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

    try {
        await addDoc(collection(db, 'harvest_sessions'), harvestPlotDocument);
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('startHarvestSession', [params]);
        } else {
            throw error;
        }
    }
};

export const updateHarvestManager = async (harvestSessionId: string, newValue: HarvestManager) => {
    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);
    const updatePayload = {
        harvest_manager: newValue,
        updated_at: Timestamp.now()
    };
    try {
        await updateDoc(harvestPlotRef, updatePayload);
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('updateHarvestManager', [harvestSessionId, newValue]);
        } else {
            throw error;
        }
    }
};

export const upsertHarvesters = async (params: UpsertHarvestersParams) => {
    const { harvestSessionId, harvestersFormData } = params;
    const updatedHarvesters = harvestersFormData.map(h => ({
        id: h.id,
        name: h.name,
        plot_map: h.plot_map || false,
        harvested_hectares: parseFloat(String(h.harvested_hectares)) || 0
    }));

    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);
    const updatePayload = {
        harvesters: updatedHarvesters,
        updated_at: Timestamp.now()
    };

    try {
        await updateDoc(harvestPlotRef, updatePayload);
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('upsertHarvesters', [params]);
        } else {
            throw error;
        }
    }
};

export const updateHarvestSessionProgress = async (
    currentSession: HarvestSession,
    newStatus: HarvestStatus,
    newHarvestedHectares: number
) => {
    const sessionRef = doc(db, "harvest_sessions", currentSession.id);
    const sessionWithNewProgress = {
        ...currentSession,
        status: newStatus,
        harvested_hectares: newHarvestedHectares,
    };
    const finalSession = getSessionWithRecalculatedYields(sessionWithNewProgress);

    const updatePayload: any = { // Usamos 'any' para flexibilidad con el payload dinámico
        status: finalSession.status,
        harvested_hectares: finalSession.harvested_hectares,
        yields: finalSession.yields,
        updated_at: Timestamp.now(),
    };

    if (finalSession.harvesters && finalSession.harvesters.length === 1) {
        const singleHarvester = finalSession.harvesters[0];
        updatePayload.harvesters = [{
            ...singleHarvester,
            harvested_hectares: finalSession.harvested_hectares,
        }];
    }

    try {
        await updateDoc(sessionRef, updatePayload);
    } catch (error: any) {
        if (error.code === 'unavailable' || !navigator.onLine) {
            await queueOfflineWrite('updateHarvestSessionProgress', [currentSession, newStatus, newHarvestedHectares]);
        } else {
            throw error;
        }
    }
};
