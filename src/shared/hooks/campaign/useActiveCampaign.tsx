import { useMemo } from 'react';
import { where } from 'firebase/firestore';
import type { Campaign } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useActiveCampaign = () => {
  const constraints = useMemo(() => [
    where('active', '==', true)
  ], []);

  const { data: campaigns, loading, error } = useFirebaseOnSnapshot<Campaign>({
    collectionName: 'campaigns',
    constraints,
  });

  const campaign = useMemo(() => 
    campaigns.length > 0 ? campaigns[0] : null, 
    [campaigns]
  );

  return { campaign, loading, error };
};
