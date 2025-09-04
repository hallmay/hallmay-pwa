import { useMemo } from 'react';
import { where, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import type { HarvestSession } from '../../../shared/types';

/** Realtime active harvest sessions (active = true => pending/in-progress). */
export const useHarvestSessionsRealtime = (
  campaignId?: string,
  fieldId?: string,
  enabled: boolean = true
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId || !enabled) return;
    const clauses: QueryConstraint[] = [
      where('campaign.id', '==', campaignId),
      where('active', '==', true),
      where('field.id', '==', fieldId),
      orderBy('date', 'desc'),
      limit(100)
    ];
    return clauses;
  }, [campaignId, fieldId, enabled]);

  const { data, loading, error } = useFirebaseOnSnapshot<HarvestSession>({
    collectionName: 'harvest_sessions',
    constraints,
    enabled: !!campaignId && !!fieldId && enabled
  });

  return { data, loading, error };
};
