import { useMemo } from 'react';
import { where } from 'firebase/firestore';
import type { Plot } from '../../types';
import { useFirebaseCollection } from '../useFirebaseCollection';

export const usePlots = (fieldId: string) => {
  const constraints = useMemo(() => 
    fieldId ? [where('field.id', '==', fieldId)] : [], 
    [fieldId]
  );

  const { data: plots, loading, error } = useFirebaseCollection<Plot>({
    collectionName: 'plots',
    constraints,
    securityOptions: {
      withFieldAccess: 'field.id'
    },
    dependencies: [fieldId],
    enabled: !!fieldId
  });

  return { plots, loading, error };
};
