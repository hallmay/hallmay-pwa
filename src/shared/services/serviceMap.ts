import { addLogisticsOrder, updateLogisticsStatus } from '../../features/logistics/services/logistics';
import { addRegister, deleteRegister, updateRegister } from '../../features/harvest/services/harvestSessionRegister';
import { createSilobag, closeSilobag, extractKgsSilobag } from '../../features/silobags/services/siloBags';
import { startHarvestSession, updateHarvestManager, updateHarvestSessionProgress, upsertHarvesters } from '../../features/harvest/services/harvestSession';

export const serviceMap = {
    'addLogisticsOrder': addLogisticsOrder,
    'updateLogisticsStatus': updateLogisticsStatus,
    'addRegister': addRegister,
    'deleteRegister': deleteRegister,
    'updateRegister': updateRegister,
    'createSilobag': createSilobag,
    'closeSilobag': closeSilobag,
    'extractKgsSilobag': extractKgsSilobag,
    'startHarvestSession': startHarvestSession,
    'updateHarvestManager': updateHarvestManager,
    'updateHarvestSessionProgress': updateHarvestSessionProgress,
    'upsertHarvesters': upsertHarvesters
};

export type ServiceFunctionMap = typeof serviceMap;