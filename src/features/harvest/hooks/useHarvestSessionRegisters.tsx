import { orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseCollection } from "../../../shared/hooks/useFirebaseCollection";
import { HarvestSession } from "../../../shared/types";


export const useHarvestSessionRegisters = (harvestSessionId: string) => {
    const constraints = useMemo(() => {
        return [
            orderBy('date', 'desc')
        ];
    }, []);

    const { data: registers, loading, error } = useFirebaseCollection<HarvestSession>({
        collectionName: `harvest_sessions/${harvestSessionId}/registers`,
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [harvestSessionId],
        enabled: !!harvestSessionId
    });

    return { registers, loading, error };
};