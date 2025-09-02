import { useMemo } from 'react';
import type { Crop } from '../../types';
import { orderBy } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useCrops = () => {
  const constraints = useMemo(() => [orderBy('name', 'asc')], []);

  const { data: crops, loading, error } = useFirebaseOnSnapshot<Crop>({
    collectionName: 'crops',
    constraints,
    
  });

  return { crops, loading, error };
};