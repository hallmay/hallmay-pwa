import {  useMemo } from 'react';
import type { HarvestSession } from '../../../shared/types';

import { useFirebaseOnSnapshot } from '../../../shared/hooks/useFirebaseOnSnapshot';
import { useFirebaseQuery } from '../../../shared/hooks/useFirebaseQuery';
import { where, orderBy, limit } from 'firebase/firestore';

export const useHarvestSessionsByCampaign = (
  campaignId?: string,
  fieldId?: string,
  options?: { includeFinished?: boolean }
) => {
  // Realtime solo para activas (pending/in-progress)
  const activeConstraints = useMemo(() => {
    if (!campaignId || !fieldId) return [];
    const clauses: any[] = [
      where('campaign.id', '==', campaignId),
      where('status', 'in', ['pending', 'in-progress']),
      where('field.id', '==', fieldId),
      orderBy('date', 'desc'),
      limit(100)
    ];
    return clauses;
  }, [campaignId, fieldId]);

  const { data: activeSessions, loading: loadingActive, error: errorActive } = useFirebaseOnSnapshot<HarvestSession>({
    collectionName: 'harvest_sessions',
    constraints: activeConstraints,
    enabled: !!campaignId && !!fieldId
  });

  // Finished on-demand (one-shot)
  const finishedConstraints = useMemo(() => {
    if (!campaignId || !fieldId) return [];
    const clauses: any[] = [
      where('campaign.id', '==', campaignId),
      where('status', '==', 'finished'),
      where('field.id', '==', fieldId),
      orderBy('date', 'desc')
    ];
    return clauses;
  }, [campaignId, fieldId]);

  const { data: finishedSessions, loading: loadingFinished, error: errorFinished } = useFirebaseQuery<HarvestSession>({
    collectionName: 'harvest_sessions',
    constraints: finishedConstraints,
    dependencies: [campaignId, fieldId, options?.includeFinished],
    enabled: (!!campaignId && !!fieldId) && (options?.includeFinished ?? true)
  });

  return {
    sessions: [...activeSessions, ...finishedSessions],
    loading: loadingActive || loadingFinished,
    error: errorActive || errorFinished
  };
};