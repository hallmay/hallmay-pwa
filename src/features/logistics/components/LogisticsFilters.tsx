import { Controller, Control, useWatch } from "react-hook-form";
import Card from "../../../shared/components/commons/Card";
import DateInput from "../../../shared/components/form/DateInput";
import Select from "../../../shared/components/form/Select";

interface CampaignFieldOption {
    field: { id: string; name: string };
}

interface LogisticsFiltersProps {
    control: Control<any>; // form is external; keeping generic
    campaignFields: CampaignFieldOption[];
    loadingFields: boolean;
    selectedField: string;
}

const LogisticsFilters = ({ control, campaignFields, loadingFields, selectedField }: LogisticsFiltersProps) => {
    const fromDate: Date | null = useWatch({ control, name: 'dateRange.from' });
    const toDate: Date | null = useWatch({ control, name: 'dateRange.to' });
    return (
        <Card>
            <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Controller name="field" control={control} render={({ field }) => (
                    <Select {...field} label="Campo" items={campaignFields.map(cf => ({ id: cf.field.id, name: cf.field.name }))} className="flex-1" disabled={loadingFields} />
                )} />
                <Controller name="dateRange.from" control={control} render={({ field }) => <DateInput {...field} label="Desde" disabled={selectedField === ''} maxDate={toDate || undefined} />} />
                <Controller name="dateRange.to" control={control} render={({ field }) => <DateInput {...field} label="Hasta" disabled={selectedField === ''} minDate={fromDate || undefined} />} />
            </div>
        </Card>
    );
};

export default LogisticsFilters