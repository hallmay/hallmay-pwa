import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import type { Campaign } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useCampaigns = () => {
  const constraints = useMemo(() => [
    orderBy('start_date', 'desc')
  ], []);

  const { data: campaigns, loading, error } = useFirebaseOnSnapshot<Campaign>({
    collectionName: 'campaigns',
    constraints,
  });

  return { campaigns, loading, error };
};
