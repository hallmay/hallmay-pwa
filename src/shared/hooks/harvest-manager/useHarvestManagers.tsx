import { useData } from "../../context/data/DataProvider";

export const useHarvestManagers = () => {
  const { managers, loading } = useData();
  return { harvestManagers: managers, loading, error: null };
};