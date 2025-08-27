import { type FC, useMemo } from "react";
import type { Campaign, HarvestSession } from "../../../../shared/types";
import Card from "../../../../shared/components/commons/Card";
import Select from "../../../../shared/components/form/Select";

export interface ReportsFiltersProps {
    campaign: string;
    crop: string;
    field: string;
    plot: string;
}
interface FilterComponentProps {
    filters: ReportsFiltersProps;
    onFilterChange: (filterName: keyof ReportsFiltersProps, value: string) => void;
    campaigns: Campaign[];
    campaignsLoading: boolean;
    sessionsForCampaign: HarvestSession[];

}

const ReportsFilters: FC<FilterComponentProps> = ({
    filters,
    onFilterChange,
    campaigns,
    campaignsLoading,
    sessionsForCampaign

}) => {

    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const unique = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        console.log(Array.from(unique.values()))
        return Array.from(unique.values());
    }, [sessionsForCampaign]);

    const availableFields = useMemo(() => {
        if (!sessionsForCampaign || filters.crop === 'all') return [];
        const filtered = sessionsForCampaign.filter(s => s.crop.id === filters.crop);
        const unique = new Map(filtered.map(s => [s.field.id, s.field]));
        return Array.from(unique.values());
    }, [sessionsForCampaign, filters.crop]);

    const availablePlots = useMemo(() => {
        if (!sessionsForCampaign || filters.field === 'all') return [];
        const filtered = sessionsForCampaign.filter(s => s.field.id === filters.field);
        const unique = new Map(filtered.map(s => [s.plot.id, s.plot]));
        return Array.from(unique.values());
    }, [sessionsForCampaign, filters.field]);

    const campaignOptions = useMemo(() => campaigns.map(c => ({ value: c.id, label: c.name })), [campaigns]);
    const cropOptions = useMemo(() => [{ value: 'all', label: 'Todos los cultivos' }, ...availableCrops.map(c => ({ value: c.id, label: c.name }))], [availableCrops]);
    const fieldOptions = useMemo(() => [{ value: 'all', label: 'Todos los campos' }, ...availableFields.map(f => ({ value: f.id, label: f.name }))], [availableFields]);
    const plotOptions = useMemo(() => [{ value: 'all', label: 'Todos los lotes' }, ...availablePlots.map(p => ({ value: p.id, label: p.name }))], [availablePlots]);

    return (
        <Card>
            <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                    name="campaign"
                    label="Campaña"
                    items={campaignOptions}
                    value={filters.campaign}
                    onChange={(newValue) => onFilterChange('campaign', newValue as string)}
                    disabled={campaignsLoading}
                />
                <Select
                    name="crop"
                    label="Cultivo"
                    items={cropOptions}
                    value={filters.crop}
                    onChange={(newValue) => onFilterChange('crop', newValue as string)}
                    disabled={!filters.campaign}
                />
                <Select
                    name="field"
                    label="Campo (Opcional)"
                    items={fieldOptions}
                    value={filters.field}
                    onChange={(newValue) => onFilterChange('field', newValue as string)}
                    disabled={filters.crop === 'all'}
                />
                <Select
                    name="plot"
                    label="Lote (Opcional)"
                    items={plotOptions}
                    value={filters.plot}
                    onChange={(newValue) => onFilterChange('plot', newValue as string)}
                    disabled={filters.field === 'all'}
                />
            </div>
        </Card>
    );
};

export default ReportsFilters;