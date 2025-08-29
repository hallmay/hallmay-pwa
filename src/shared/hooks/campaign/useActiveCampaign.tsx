import { useMemo } from 'react';
import { where } from 'firebase/firestore';
import type { Campaign } from '../../types';
import { useFirebaseCollection } from '../useFirebaseCollection';

export const useActiveCampaign = () => {
  const constraints = useMemo(() => [
    where('active', '==', true)
  ], []);

  const { data: campaigns, loading, error } = useFirebaseCollection<Campaign>({
    collectionName: 'campaigns',
    constraints,
    securityOptions: {}
  });

  // Memoizar campaign individual para evitar re-renders
  const campaign = useMemo(() => 
    campaigns.length > 0 ? campaigns[0] : null, 
    [campaigns]
  );

  return { campaign, loading, error };
};
