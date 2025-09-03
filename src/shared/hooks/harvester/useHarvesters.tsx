import { useData } from '../../context/data/DataProvider';

export const useHarvesters = () => {
  const { harvesters, loading } = useData();
  return { harvesters, loading, error: null };
};