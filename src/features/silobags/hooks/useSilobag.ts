
import { useFirebaseDocument } from '../../../shared/hooks/useFirebaseDocument';
import type { Silobag } from '../../../shared/types';

export const useSiloBag = (siloBagId: string) => {
        const { 
            data: siloBag, 
            loading, 
            error, 
        } = useFirebaseDocument<Silobag>({
            collectionName: 'silo_bags',
            documentId: siloBagId,
            enabled: !!siloBagId,
        });
    
        return { siloBag, loading, error };

};