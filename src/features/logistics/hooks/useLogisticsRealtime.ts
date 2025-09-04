import { useMemo } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { orderBy, where, Timestamp, QueryConstraint } from 'firebase/firestore';
import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import { Logistics } from '../../../shared/types';

/**
 * Realtime logistics for TODAY only (active = true) within campaign & field.
 * Keeps listener narrow to reduce costs.
 */
export const useLogisticsRealtime = (
  campaignId: string,
  fieldId: string,
  includeToday: boolean
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId || !includeToday) return;
    const now = new Date();
    const start = Timestamp.fromDate(startOfDay(now));
    const end = Timestamp.fromDate(endOfDay(now));
    return [
      where('campaign.id', '==', campaignId),
      where('field.id', '==', fieldId),
      where('date', '>=', start),
      where('date', '<=', end),
      where('active', '==', true),
      orderBy('date', 'desc')
    ] as QueryConstraint[];
  }, [campaignId, fieldId, includeToday]);

  const { data, loading, error } = useFirebaseOnSnapshot<Logistics>({
    collectionName: 'logistics',
    constraints,
    dependencies: [campaignId, fieldId, includeToday],
    enabled: !!campaignId && !!fieldId && includeToday
  });

  return { data, loading, error };
};
