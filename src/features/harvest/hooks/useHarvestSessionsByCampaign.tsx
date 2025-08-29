import {  useMemo } from 'react';
import type { HarvestSession } from '../../../shared/types';

import { useFirebaseCollection } from '../../../shared/hooks/useFirebaseCollection';
import { where } from 'firebase/firestore';

export const useHarvestSessionsByCampaign = (campaignId: string) => {
        const constraints = useMemo(() => {
                if (!campaignId) return [];
                return [
                    where('campaign.id', '==', campaignId)
                ];
            }, [campaignId]);
        
          const { data: sessions, loading, error } = useFirebaseCollection<HarvestSession>({
            collectionName: 'harvest_sessions',
            constraints,
            securityOptions: {
              withFieldAccess: 'field.id'
            },
            // Remover dependencies porque campaignId ya está en constraints
            enabled: !!campaignId
          });
        
          return { sessions, loading, error };
};