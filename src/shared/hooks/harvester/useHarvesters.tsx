import type { Harvester } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useHarvesters = () => {
  const { data: harvesters, loading, error } = useFirebaseOnSnapshot<Harvester>({
    collectionName: 'harvesters'
  });

  return { harvesters, loading, error };
};
