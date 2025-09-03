import { useData } from '../../context/data/DataProvider';

export const usePlots = () => {
  const { plots, loading} = useData();

  return {plots,loading}
};
