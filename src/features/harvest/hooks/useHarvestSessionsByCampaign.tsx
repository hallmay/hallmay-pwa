import {  useMemo } from 'react';
import type { HarvestSession } from '../../../shared/types';

import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import { where } from 'firebase/firestore';

export const useHarvestSessionsByCampaign = (campaignId: string,fieldId:string) => {
        const constraints = useMemo(() => {
                if (!campaignId || !fieldId) return [];
                return [
                    where('campaign.id', '==', campaignId),
                    where('field.id', '==', fieldId)
                ];
            }, [campaignId,fieldId]);
        
          const { data: sessions, loading, error } = useFirebaseOnSnapshot<HarvestSession>({
            collectionName: 'harvest_sessions',
            constraints,
            securityOptions: {
            withFieldAccess: 'field.id'
            },
            enabled: !!campaignId && !!fieldId
          });
        
          return { sessions, loading, error };
};