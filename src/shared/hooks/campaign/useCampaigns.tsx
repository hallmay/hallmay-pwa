import { useData } from '../../context/data/DataProvider';
import { useMemo } from 'react';

export const useCampaigns = () => {
  const { campaigns, loading } = useData();

  const sortedCampaigns = useMemo(() => 
    [...campaigns].sort((a, b) => b.start_date.toMillis() - a.start_date.toMillis()), 
    [campaigns]
  );

  return { campaigns: sortedCampaigns, loading, error: null };
};