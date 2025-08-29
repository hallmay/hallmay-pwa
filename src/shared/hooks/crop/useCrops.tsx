import type { Crop } from '../../types';

import { useFirebaseCollection } from '../useFirebaseCollection';

export const useCrops = () => {
      const { data: crops, loading, error, refetch } = useFirebaseCollection<Crop>({
        collectionName: 'crops',
        constraints: []
      });

      return { crops, loading, error, refetch };

};