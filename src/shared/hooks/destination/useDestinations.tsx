import type { Destination } from '../../types';


import { useFirebaseCollection } from '../useFirebaseCollection';

export const useDestinations = () => {
    
    
      const { data: destinations, loading, error } = useFirebaseCollection<Destination>({
        collectionName: 'destinations',
        constraints: []
      });

    return { destinations, loading, error };
};