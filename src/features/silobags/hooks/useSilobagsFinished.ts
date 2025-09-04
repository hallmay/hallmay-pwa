import { useMemo } from 'react';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { useFirebaseQuery } from '../../../shared/hooks/useFirebaseQuery';
import type { Silobag } from '../../../shared/types';

/** Non-realtime finished silo bags (status=finished). */
export const useSilobagsFinished = (
  campaignId: string | undefined,
  fieldId: string,
  cropId: string | null | undefined,
  enabled: boolean
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId || !enabled) return [] as QueryConstraint[];
    const base: QueryConstraint[] = [
      where('campaign.id', '==', campaignId),
      where('field.id', '==', fieldId),
      where('status', '==', 'finished'),
      orderBy('date', 'desc')
    ];
    if (cropId && cropId !== 'all') base.push(where('crop.id', '==', cropId));
    return base;
  }, [campaignId, fieldId, cropId, enabled]);

  const { data, loading, error } = useFirebaseQuery<Silobag>({
    collectionName: 'silo_bags',
    constraints,
    dependencies: [campaignId, fieldId, cropId, enabled],
    enabled: !!campaignId && !!fieldId && enabled
  });

  return { data, loading, error };
};
