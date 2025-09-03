import { useData } from '../../context/data/DataProvider';

export const useDestinations = () => {
  const { destinations, loading } = useData();
  return { destinations, loading, error: null };
};