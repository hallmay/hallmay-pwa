import type { Destination } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useDestinations = () => {
  const { data: destinations, loading, error } = useFirebaseOnSnapshot<Destination>({
    collectionName: 'destinations',
    constraints: [],
    
  });

  return { destinations, loading, error };
};