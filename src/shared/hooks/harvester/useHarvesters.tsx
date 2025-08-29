import type { Harvester } from '../../types';
import { useFirebaseCollection } from '../useFirebaseCollection';

export const useHarvesters = () => {
  const { data: harvesters, loading, error } = useFirebaseCollection<Harvester>({
    collectionName: 'harvesters'
  });

  return { harvesters, loading, error };
};
