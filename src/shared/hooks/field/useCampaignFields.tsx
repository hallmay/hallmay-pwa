import type { CampaignField } from '../../types';
import { where } from 'firebase/firestore';
import { useFirebaseCollection } from '../useFirebaseCollection';
import { useMemo } from 'react';

export const useCampaignFields = (campaignId: string) => {
    const constraints = useMemo(() => {
        return [
            where('campaign.id', '==', campaignId)
        ];
    }, [campaignId]);

    const { data: campaignFields, loading, error } = useFirebaseCollection<CampaignField>({
        collectionName: 'campaign_fields',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        enabled: !!campaignId,
    });

    return { campaignFields, loading, error };
};