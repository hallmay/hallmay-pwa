import { endOfDay, startOfDay } from "date-fns";
import { orderBy, where, Timestamp, QueryConstraint } from "firebase/firestore";
import { useMemo } from "react";
import { useFirebaseOnSnapshot } from "../../../shared/hooks/useFirebaseOnSnapshot";
import { HarvestSession } from "../../../shared/types";

export const useLogistics = (dateRange: { from: Date | null, to: Date | null }, selectedField: string) => {

    const constraints = useMemo(() => {
        const baseConstraints: QueryConstraint[] = [orderBy('date', 'desc')];
        if (dateRange.from) {
            baseConstraints.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
        }
        if (dateRange.to) {
            baseConstraints.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
        }
        if (selectedField && selectedField !== 'all') {
            baseConstraints.push(where('field.id', '==', selectedField));
        }
        return baseConstraints;
    }, [dateRange, selectedField]);

    const { data: logistics, loading, error } = useFirebaseOnSnapshot<HarvestSession>({
        collectionName: 'logistics',
        constraints,
        securityOptions: {
            withFieldAccess: 'field.id'
        },
        dependencies: [dateRange, selectedField],
        enabled: !!dateRange.from || !!dateRange.to || !!selectedField
    });


    return { logistics, loading, error };
};