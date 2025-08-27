// src/pages/dashboards/Reports.tsx - Optimizado con Outlet
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import PageHeader from "../../shared/components/layout/PageHeader";
import { type FC, useState, useEffect, useMemo, useCallback } from "react";
import Card from "../../shared/components/commons/Card";
import { useCampaigns } from "../../shared/hooks/campaign/useCampaigns";
import { useHarvestSessionsByCampaign } from "../harvest/hooks/useHarvestSessionsByCampaign";
import type { ReportsFiltersProps } from "./components/commons/ReportsFilters";
import ReportsFilters from "./components/commons/ReportsFilters";
import PageLoader from "../../shared/components/layout/PageLoader";
import { useReportsAnalytics } from "./hooks/useReportsAnalytics";

const Reports: FC = () => {

    const [filters, setFilters] = useState<ReportsFiltersProps>({
        campaign: '', crop: 'all', field: 'all', plot: 'all',
    });
    const { campaigns, loading: campaignsLoading } = useCampaigns();
    const { sessions: sessionsForCampaign } = useHarvestSessionsByCampaign(filters.campaign);
    const analytics = useReportsAnalytics(filters);
    const navigate = useNavigate();



    useEffect(() => {
        if (campaigns.length > 0 && !filters.campaign) {
            const activeCampaign = campaigns.find(c => c.active === true) || campaigns[0];
            if (activeCampaign) {
                setFilters(prev => ({ ...prev, campaign: activeCampaign.id }));
            }
        }
    }, [campaigns, filters.campaign]);

    const handleFilterChange = useCallback((filterName: keyof ReportsFiltersProps, value: string) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters, [filterName]: value };
            if (filterName === 'campaign') {
                newFilters.crop = 'all'; newFilters.field = 'all'; newFilters.plot = 'all';
            }
            if (filterName === 'crop') {
                newFilters.field = 'all'; newFilters.plot = 'all';
            }
            if (filterName === 'field') {
                newFilters.plot = 'all';
            }
            return newFilters;
        });
    }, []);

    const matchHarvests = useMatch('/reports/harvests');
    const matchHarvesters = useMatch('/reports/harvesters');
    const matchDestinations = useMatch('/reports/destinations');

    const activeTab = useMemo(() => {
        if (matchHarvesters) return 'harvesters';
        if (matchDestinations) return 'destinations';
        return 'harvests';
    }, [matchHarvests, matchHarvesters, matchDestinations]);

    // Redirige a la pestaña por defecto si se accede a la ruta base sin sub-ruta
    useEffect(() => {
        if (!matchHarvests && !matchHarvesters && !matchDestinations) {
            navigate('/reports/harvests', { replace: true });
        }
    }, [matchHarvests, matchHarvesters, matchDestinations, navigate]);

    const TabButton: FC<{ isActive: boolean; to: string; children: React.ReactNode }> = ({
        isActive,
        to,
        children
    }) => (
        <Link
            to={to}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm
                ${isActive
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
        >
            {children}
        </Link>
    );

    if (campaignsLoading) {
        return <PageLoader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} message="Cargando reportes..." />;
    }

    if (campaigns.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />
                <Card>
                    <p className="text-center text-text-secondary">No hay campañas disponibles.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />

            <ReportsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                campaigns={campaigns}
                campaignsLoading={campaignsLoading}
                sessionsForCampaign={sessionsForCampaign}
            />

            {/* Tabs */}
            <div className="flex text-center space-x-1 bg-background p-1 rounded-xl overflow-x-auto shadow-sm">
                <TabButton isActive={activeTab === 'harvests'} to="/reports/harvests">Cosecha</TabButton>
                <TabButton isActive={activeTab === 'harvesters'} to="/reports/harvesters">Cosecheros</TabButton>
                <TabButton isActive={activeTab === 'destinations'} to="/reports/destinations">Destinos</TabButton>
            </div>

            {/* Mostrar estado de carga global */}
            {analytics.loading && (
                <Card>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Cargando datos de reportes...</p>
                    </div>
                </Card>
            )}

            {/* Mostrar error global */}
            {analytics.error && !analytics.loading && (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-2">Error al cargar los datos:</p>
                        <p className="text-text-secondary text-sm">{analytics.error}</p>
                    </div>
                </Card>
            )}

            {/* Contenido dinámico según la pestaña seleccionada usando Outlet */}
            {!analytics.loading && !analytics.error && (
                <div className="animate-fade-in-fast">
                    <Outlet context={{ analytics }} />
                </div>
            )}
        </div>
    );
};

export default Reports;