import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import type { Campaign } from '../../types';
import { useFirebaseCollection } from '../useFirebaseCollection';

export const useCampaigns = () => {
  const constraints = useMemo(() => [
    orderBy('start_date', 'desc')
  ], []);

  const { data: campaigns, loading, error } = useFirebaseCollection<Campaign>({
    collectionName: 'campaigns',
    constraints
  });

  return { campaigns, loading, error };
};
