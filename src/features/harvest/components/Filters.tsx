import { type FC, useMemo } from "react";
import type { CampaignField, HarvestSession } from "../../../shared/types";
import Card from "../../../shared/components/commons/Card";
import Select from "../../../shared/components/form/Select";

export interface SessionsFiltersProps {
    crop: string;
    field: string;
}

interface FilterComponentProps {
    filters: SessionsFiltersProps;
    onFilterChange: (filterName: keyof SessionsFiltersProps, value: string) => void;
    sessionsForCampaign: HarvestSession[];
    campaignFields: CampaignField[];

}

const SessionsFilters: FC<FilterComponentProps> = ({
    filters,
    onFilterChange,
    sessionsForCampaign,
    campaignFields
}) => {

    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const unique = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        return Array.from(unique.values());
    }, [sessionsForCampaign]);

    const cropOptions = useMemo(() => [{ value: 'all', label: 'Todos los cultivos' }, ...availableCrops.map(c => ({ value: c.id, label: c.name }))], [availableCrops]);
    const fieldOptions = useMemo(() => campaignFields.map(f => ({ value: f.field.id, label: f.field.name })), [campaignFields]);
    return (
        <Card>
            <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                    name="field"
                    label="Campo"
                    items={fieldOptions}
                    value={filters.field}
                    onChange={(newValue) => onFilterChange('field', newValue as string)}
                />
                <Select
                    name="crop"
                    label="Cultivo (Opcional)"
                    items={cropOptions}
                    value={filters.crop}
                    onChange={(newValue) => onFilterChange('crop', newValue as string)}
                    disabled={filters.field === ''}
                />
            </div>
        </Card>
    );
};

export default SessionsFilters;