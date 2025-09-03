import { useData } from '../../context/data/DataProvider';

export const useCampaignFields = () => {
    const { campaignFields, loading } = useData();

    return { campaignFields, loading, error: null };
};