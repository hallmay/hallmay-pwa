import { useMemo } from 'react';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { useFirebaseQuery } from '../../../shared/hooks/useFirebaseQuery';
import type { HarvestSession } from '../../../shared/types';

/** One-shot finished / closed harvest sessions (active = false). */
export const useHarvestSessionsFinished = (
  campaignId?: string,
  fieldId?: string,
  enabled: boolean = true
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId || !enabled) return [] as QueryConstraint[];
    const clauses: QueryConstraint[] = [
      where('campaign.id', '==', campaignId),
      where('active', '==', false),
      where('field.id', '==', fieldId),
      orderBy('date', 'desc')
    ];
    return clauses;
  }, [campaignId, fieldId, enabled]);

  const { data, loading, error } = useFirebaseQuery<HarvestSession>({
    collectionName: 'harvest_sessions',
    constraints,
    dependencies: [campaignId, fieldId, enabled],
    enabled: !!campaignId && !!fieldId && enabled
  });

  return { data, loading, error };
};
