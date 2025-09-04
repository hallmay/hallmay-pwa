import { useMemo } from 'react';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import type { Silobag } from '../../../shared/types';

/** Realtime silo bags (status=active). */
export const useSilobagsRealtime = (
  campaignId: string | undefined,
  fieldId: string,
  cropId: string | null | undefined,
  enabled: boolean
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId || !enabled) return;
    const base: QueryConstraint[] = [
      where('campaign.id', '==', campaignId),
      where('field.id', '==', fieldId),
      where('status', '==', 'active'),
      orderBy('date', 'desc')
    ];
    if (cropId && cropId !== 'all') base.push(where('crop.id', '==', cropId));
    return base;
  }, [campaignId, fieldId, cropId, enabled]);

  const { data, loading, error } = useFirebaseOnSnapshot<Silobag>({
    collectionName: 'silo_bags',
    constraints,
    dependencies: [campaignId, fieldId, cropId, enabled],
    enabled: !!campaignId && !!fieldId && enabled
  });

  return { data, loading, error };
};
