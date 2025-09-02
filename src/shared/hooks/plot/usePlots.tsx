import { useMemo } from 'react';
import { where } from 'firebase/firestore';
import type { Plot } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const usePlots = (fieldId: string) => {
  const constraints = useMemo(() => 
    fieldId ? [where('field.id', '==', fieldId)] : [], 
    [fieldId]
  );

  const { data: plots, loading, error } = useFirebaseOnSnapshot<Plot>({
    collectionName: 'plots',
    constraints,
    securityOptions: {
      withFieldAccess: 'field.id'
    },
    enabled: !!fieldId
  });

  return { plots, loading, error };
};
