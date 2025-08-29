import { where } from "firebase/firestore";
import { HarvestManager } from "../../types";
import { useFirebaseCollection } from "../useFirebaseCollection";

export const useHarvestManagers = () => {
        const { data: harvestManagers, loading, error } = useFirebaseCollection<HarvestManager>({
                collectionName: 'users',
                constraints: [where('role', '==', 'manager')],
              });

    return { harvestManagers, loading, error };
};