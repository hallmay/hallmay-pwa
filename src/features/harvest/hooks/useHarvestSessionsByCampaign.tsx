import {  useMemo } from 'react';
import type { HarvestSession } from '../../../shared/types';

import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import { where } from 'firebase/firestore';

export const useHarvestSessionsByCampaign = (campaignId: string) => {
        const constraints = useMemo(() => {
                if (!campaignId) return [];
                return [
                    where('campaign.id', '==', campaignId)
                ];
            }, [campaignId]);
        
          const { data: sessions, loading, error } = useFirebaseOnSnapshot<HarvestSession>({
            collectionName: 'harvest_sessions',
            constraints,
            securityOptions: {
              withFieldAccess: 'field.id'
            },
            enabled: !!campaignId
          });
        
          return { sessions, loading, error };
};