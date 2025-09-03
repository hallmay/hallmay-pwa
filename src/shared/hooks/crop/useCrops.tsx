import { useData } from '../../context/data/DataProvider';

export const useCrops = () => {
  const { crops, loading } = useData();
  return { crops, loading, error: null };
};