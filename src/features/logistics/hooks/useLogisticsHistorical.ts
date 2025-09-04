import { useMemo } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { orderBy, where, Timestamp, QueryConstraint, limit } from 'firebase/firestore';
import { useFirebaseQuery } from '../../../shared/hooks/useFirebaseQuery';
import { Logistics } from '../../../shared/types';

/**
 * Historical logistics (non realtime). Can include arbitrary date range.
 * If the provided range crosses today AND realtime is enabled separately, we exclude today's docs here to avoid duplication.
 */
export const useLogisticsHistorical = (
  campaignId: string,
  fieldId: string,
  dateRange: { from: Date | null; to: Date | null },
  excludeToday: boolean
) => {
  const constraints = useMemo(() => {
    if (!campaignId || !fieldId) return [] as QueryConstraint[];
    const now = new Date();
    const todayStart = startOfDay(now);
    const base: QueryConstraint[] = [
      where('campaign.id', '==', campaignId),
      where('field.id', '==', fieldId)
    ];

    if (dateRange.from) {
      base.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
    }
    if (excludeToday) {
      // Excluimos completamente hoy porque el realtime lo cubre
      base.push(where('date', '<', Timestamp.fromDate(todayStart)));
    } else if (dateRange.to) {
      // Solo aplicamos upper bound del rango si no estamos excluyendo hoy
      base.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
    }
    base.push(orderBy('date', 'desc'));
    base.push(limit(200));
    return base;
  }, [campaignId, fieldId, dateRange.from, dateRange.to, excludeToday]);

  const { data, loading, error } = useFirebaseQuery<Logistics>({
    collectionName: 'logistics',
    constraints,
    dependencies: [campaignId, fieldId, dateRange.from?.getTime(), dateRange.to?.getTime(), excludeToday],
    enabled: !!campaignId && !!fieldId
  });

  return { data, loading, error };
};
