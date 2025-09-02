import { orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseOnSnapshot } from "../../../shared/hooks/useFirebaseOnSnapshot";
import { HarvestSessionRegister } from "../../../shared/types";


export const useHarvestSessionRegisters = (harvestSessionId: string) => {
    const constraints = useMemo(() => {
        return [
            orderBy('date', 'desc')
        ];
    }, []);

    const { data: registers, loading, error } = useFirebaseOnSnapshot<HarvestSessionRegister>({
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