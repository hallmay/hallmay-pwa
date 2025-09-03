import { where } from 'firebase/firestore';
import { Plot } from '../../types';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

type UsePlotsOptions = {
  enabled?: boolean;
};

export const usePlots = (fieldId: string, options: UsePlotsOptions = {}) => {
  const enabled = (options.enabled ?? true) && !!fieldId;

  const { data: plots, loading: loadingPlots, error: errorPlots } = useFirebaseOnSnapshot<Plot>({
    collectionName: 'plots',
    constraints: [where('field.id', '==', fieldId)],
    dependencies: [fieldId, enabled],
    enabled,
  });

  return { plots, loading: loadingPlots, error: errorPlots };
};
