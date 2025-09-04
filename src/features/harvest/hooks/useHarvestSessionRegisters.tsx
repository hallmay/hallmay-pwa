import { orderBy, where } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseOnSnapshot } from "../../../shared/hooks/useFirebaseOnSnapshot";
import { HarvestSessionRegister } from "../../../shared/types";


export const useHarvestSessionRegisters = (harvestSessionId: string, fieldId: string) => {
    const constraints = useMemo(() => {
        if (!fieldId) return [];
        return [
            where('field.id', '==', fieldId),
            orderBy('date', 'desc'),
        ];
    }, [fieldId]);

    const { data: registers, loading, error } = useFirebaseOnSnapshot<HarvestSessionRegister>({
        collectionName: `harvest_sessions/${harvestSessionId}/registers`,
        constraints,
        enabled: !!harvestSessionId || !!fieldId
    });

    return { registers, loading, error };
};