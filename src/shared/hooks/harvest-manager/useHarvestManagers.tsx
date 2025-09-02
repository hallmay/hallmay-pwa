import { where } from "firebase/firestore";
import { HarvestManager } from "../../types";
import { useFirebaseQuery } from "../useFirebaseQuery";

export const useHarvestManagers = () => {
        const { data: harvestManagers, loading, error, refetch } = useFirebaseQuery<HarvestManager>({
                collectionName: 'users',
                constraints: [where('role', '==', 'manager')]
              });

    return { harvestManagers, loading, error, refetch };
};