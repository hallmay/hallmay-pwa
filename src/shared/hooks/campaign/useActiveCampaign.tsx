import { useData } from "../../context/data/DataProvider";

export const useActiveCampaign = () => {
  const {activeCampaign, loading} = useData();

  return { campaign: activeCampaign, loading, error: null };
};
