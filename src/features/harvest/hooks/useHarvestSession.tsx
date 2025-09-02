import type { HarvestSession } from '../../../shared/types';
import { useFirebaseDocument } from '../../../shared/hooks/useFirebaseDocument';

export const useHarvestSession = (harvestSessionId: string) => {
    const { 
        data: session, 
        loading, 
        error, 
    } = useFirebaseDocument<HarvestSession>({
        collectionName: 'harvest_sessions',
        documentId: harvestSessionId,
        enabled: !!harvestSessionId,
        realtime: true
    });

    return { session, loading, error };
};