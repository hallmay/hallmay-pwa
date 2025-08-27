import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import Card from '../../shared/components/commons/Card';
import PageHeader from '../../shared/components/layout/PageHeader';
import { useActiveCampaign } from '../../shared/hooks/campaign/useActiveCampaign';
import { useCampaignFields } from '../../shared/hooks/field/useCampaignFields';
import { useActiveHarvestSessions } from './hooks/useActiveHarvestSessions';
import PageLoader from '../../shared/components/layout/PageLoader';
import Select from '../../shared/components/form/Select';
import SessionsListSection from './components/SessionListSection';

const HarvestView = () => {
    const { control } = useForm({
        defaultValues: { fieldId: 'all' }
    });
    const selectedFieldId = useWatch({ control, name: 'fieldId' });

    // Hooks principales
    const { campaign, loading: loadingActiveCampaign, error: activeCampaignError } = useActiveCampaign();
    const { campaignFields, loading: loadingCampaignFields, error: campaignFieldsError } = useCampaignFields(campaign?.id);
    const { sessions: harvestSessions, loading: loadingSessions } = useActiveHarvestSessions(campaign?.id, selectedFieldId);

    const fieldOptions = useMemo(() => [{ value: 'all', label: 'Todos los campos' }, ...campaignFields.map(f => ({ value: f.field.id, label: f.field.name }))], [campaignFields]);

    const isLoading = loadingActiveCampaign || loadingCampaignFields || loadingSessions;

    if (isLoading) {
        return <PageLoader title="Cosecha Actual" breadcrumbs={[{ label: 'Información de cosecha' }]} />;
    }

    // Manejo de errores
    if (activeCampaignError) {
        return (
            <div className="space-y-4">
                <PageHeader title="Cosecha Actual" breadcrumbs={[{ label: 'Información de cosecha' }]} />
                <Card>
                    <p className="text-center text-red-500">Error al cargar la campaña: {activeCampaignError}</p>
                </Card>
            </div>
        );
    }

    // Sin campaña activa
    if (!loadingActiveCampaign && !campaign) {
        return (
            <div className="space-y-4">
                <PageHeader title="Cosecha Actual" breadcrumbs={[{ label: 'Información de cosecha' }]} />
                <Card>
                    <p className="text-center text-gray-500">No hay una campaña activa configurada.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader
                title="Cosecha Actual"
                breadcrumbs={[{ label: 'Información de cosecha' }]}
            />

            <Card>

                <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <Controller
                        name="fieldId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Campo"
                                name="fieldId"
                                placeholder={loadingCampaignFields ? "Cargando campos..." : "Todos los campos"}
                                items={fieldOptions}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loadingCampaignFields || !!campaignFieldsError}
                            />
                        )}
                    />
                    {campaignFieldsError && (
                        <p className="text-red-500 text-sm mt-2">
                            No se pudieron cargar los campos.
                        </p>
                    )}
                </div>
            </Card >

            <SessionsListSection
                sessions={harvestSessions || []}
                loading={isLoading}
                selectedFieldId={selectedFieldId}
            />
        </div >
    );
};

export default HarvestView;