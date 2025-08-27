import { Award, Hash, Tractor, TrendingUp } from "lucide-react";
import type { FC } from "react";
import Card from "../../../../shared/components/commons/Card";
import { useOutletContext } from "react-router";
import { formatNumber } from "../../../../shared/utils";

// --- Componente para un único item de Cosechero (responsive) ---

const HarvesterItem: FC<{ itemData: any; rank: number; maxYield: number }> = ({ itemData: h, rank }) => {

    const getMedalOrRank = (index: number) => {
        const baseClasses = "flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg";
        if (index === 0) return <span className={`${baseClasses} bg-yellow-100 text-yellow-600`}><Award size={18} /></span>;
        if (index === 1) return <span className={`${baseClasses} bg-slate-200 text-slate-600`}><Award size={18} /></span>;
        if (index === 2) return <span className={`${baseClasses} bg-orange-100 text-orange-600`}><Award size={18} /></span>;
        return <span className={`${baseClasses} text-slate-400`}>{index + 1}</span>;
    };

    return (
        <Card className="p-4 rounded-xl transition-colors nth-child-even:bg-background">
            {/* --- LAYOUT PARA WEB (Visible desde 'md' hacia arriba) --- */}
            <div className="hidden md:grid grid-cols-12 gap-x-6 items-center">
                {/* -- 1. Ranking y Nombre -- */}
                <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                    <div className="flex-shrink-0">{getMedalOrRank(rank)}</div>
                    <div className="flex-1">
                        <p className="font-bold text-base text-text-primary">{h.harvester.name}</p>
                    </div>
                </div>
                {/* -- 2. Métrica Principal -- */}
                <div className="col-span-12 md:col-span-4 py-4 md:py-0 text-center flex flex-col justify-center items-center md:border-x border-gray-200">
                    <p className="text-3xl font-bold text-primary">{formatNumber(h.average_yield_kg_ha)}</p>
                    <p className="text-xs text-text-secondary -mt-1">Rinde Promedio (kg/ha)</p>
                </div>
                {/* -- 3. KPIs Secundarios -- */}
                {/* CAMBIO: Se usa justify-center y gap para una alineación perfecta */}
                <div className="col-span-12 md:col-span-4 flex items-center justify-center gap-8">
                    <div className="text-center" title="Total Cosechado">
                        <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(h.total_harvested_kgs)}</p>
                        <p className="text-xs text-text-secondary">Kgs Totales</p>
                    </div>
                    <div className="text-center" title="Superficie Trabajada">
                        <Tractor size={20} className="mx-auto text-yellow-600 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(h.total_harvested_hectares)}</p>
                        <p className="text-xs text-text-secondary">Hectáreas</p>
                    </div>
                    <div className="text-center" title="Sesiones de Cosecha">
                        <Hash size={20} className="mx-auto text-purple-500 mb-1" />
                        <p className="font-semibold text-text-primary">{h.session_count}</p>
                        <p className="text-xs text-text-secondary">Sesiones</p>
                    </div>
                </div>
            </div>

            {/* --- LAYOUT PARA MÓVIL (Oculto desde 'md' hacia arriba) --- */}
            <div className="md:hidden flex flex-col">
                {/* -- 1. Identidad -- */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">{getMedalOrRank(rank)}</div>
                        <p className="font-bold text-base text-text-primary">{h.harvester.name}</p>
                    </div>
                </div>
                {/* -- 2. Métrica Principal (Centrada entre bordes) -- */}
                {/* CAMBIO: Se aplica border-y para tener línea arriba y abajo */}
                <div className="text-center border-y border-gray-200 my-4 py-4">
                    <p className="text-3xl font-bold text-primary">{formatNumber(h.average_yield_kg_ha)}</p>
                    <p className="text-xs text-text-secondary -mt-1">Rinde Promedio (kg/ha)</p>
                </div>
                {/* -- 3. KPIs Secundarios -- */}
                <div className="flex items-center justify-around">
                    <div className="text-center" title="Total Cosechado">
                        <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(h.total_harvested_kgs)}</p>
                        <p className="text-xs text-text-secondary">Kgs Totales</p>
                    </div>
                    <div className="text-center" title="Superficie Trabajada">
                        <Tractor size={20} className="mx-auto text-yellow-600 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(h.total_harvested_hectares)}</p>
                        <p className="text-xs text-text-secondary">Hectáreas</p>
                    </div>
                    <div className="text-center" title="Sesiones de Cosecha">
                        <Hash size={20} className="mx-auto text-purple-500 mb-1" />
                        <p className="font-semibold text-text-primary">{h.session_count}</p>
                        <p className="text-xs text-text-secondary">Sesiones</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- Componente Principal de la Sección ---

export const HarvestersSection: FC = () => {
    const { analytics } = useOutletContext<any>();

    if (!analytics?.harvestersSummary || analytics.harvestersSummary.length === 0) {
        return (
            <Card className="text-center py-10 text-text-secondary">
                <Tractor size={40} className="mx-auto mb-2 text-gray-300" />
                <p>No hay datos de cosecheros para los filtros seleccionados.</p>
            </Card>
        );
    }

    const sortedSummary = [...analytics.harvestersSummary].sort((a: any, b: any) => b.average_yield_kg_ha - a.average_yield_kg_ha);
    const maxYield = sortedSummary[0]?.average_yield_kg_ha || 0;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-text-primary">Desempeño de Cosecheros</h3>
            </div>
            <div className="flex flex-col">
                <div className="space-y-4">
                    {sortedSummary.map((h: any, i: number) => (
                        <HarvesterItem key={h.id} itemData={h} rank={i} maxYield={maxYield} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HarvestersSection;