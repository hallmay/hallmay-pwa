import { useHarvestSessionsRealtime } from './useHarvestSessionsRealtime';
import { useHarvestSessionsFinished } from './useHarvestSessionsFinished';

export const useHarvestSessionsByCampaign = (
  campaignId?: string,
  fieldId?: string,
  options?: { includeFinished?: boolean }
) => {
  const { data: activeSessions = [], loading: loadingActive, error: errorActive } = useHarvestSessionsRealtime(
    campaignId,
    fieldId,
    !!campaignId && !!fieldId
  );

  const includeFinished = options?.includeFinished ?? true;
  const { data: finishedSessions = [], loading: loadingFinished, error: errorFinished } = useHarvestSessionsFinished(
    campaignId,
    fieldId,
    includeFinished && !!campaignId && !!fieldId
  );

  return {
    sessions: [...activeSessions, ...finishedSessions],
    loading: loadingActive || loadingFinished,
    error: errorActive || errorFinished
  };
};