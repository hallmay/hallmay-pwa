import type { CampaignField } from '../../types';
import { where } from 'firebase/firestore';
import { useMemo } from 'react';
import { useFirebaseOnSnapshot } from '../useFirebaseOnSnapshot';

export const useCampaignFields = (campaignId: string | undefined) => {
    const constraints = useMemo(() => {
        return [
            where('campaign.id', '==', campaignId)
        ];
    }, [campaignId]);

    const { data: campaignFields, loading, error } = useFirebaseOnSnapshot<CampaignField>({
        collectionName: 'campaign_fields',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        enabled: !!campaignId
    });

    return { campaignFields, loading, error };
};