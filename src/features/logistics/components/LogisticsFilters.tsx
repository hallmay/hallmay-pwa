import { Controller } from "react-hook-form";
import Card from "../../../shared/components/commons/Card";
import DateInput from "../../../shared/components/form/DateInput";
import Select from "../../../shared/components/form/Select";

const LogisticsFilters = ({ control, campaignFields, loadingFields }) => (
    <Card>
        <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Controller name="dateRange.from" control={control} render={({ field }) => <DateInput {...field} label="Desde" />} />
            <Controller name="dateRange.to" control={control} render={({ field }) => <DateInput {...field} label="Hasta" />} />
            <Controller name="field" control={control} render={({ field }) => (
                <Select {...field} label="Campo" items={[{ id: 'all', name: 'Todos los campos' }, ...campaignFields.map(cf => ({ id: cf.field.id, name: cf.field.name }))]} className="flex-1" disabled={loadingFields} />
            )} />
        </div>
    </Card>
);

export default LogisticsFilters