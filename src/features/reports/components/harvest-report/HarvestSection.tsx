import type { FC } from "react";
import { useOutletContext } from "react-router";
import { Scale, Tractor, Leaf, Target, ClipboardCheck, BarChart3, TrendingUp } from "lucide-react";
import Card from "../../../../shared/components/commons/Card";
import { formatNumber } from "../../../../shared/utils";

const HarvestSection: FC = () => {
    const { analytics } = useOutletContext<any>();

    if (!analytics.harvestSummary) {
        return (
            <Card className="p-6 text-center animate-fade-in">
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                    <BarChart3 className="h-12 w-12 mb-4 text-gray-400" />
                    <h3 className="font-semibold text-lg text-gray-700">Sin Datos de Cosecha</h3>
                    <p className="mt-2 max-w-sm mx-auto">No se encontraron datos de cosecha para mostrar en este momento.</p>
                </div>
            </Card>
        );
    }

    const totalKg = analytics.harvestSummary.total_kgs || 0;
    const harvestedYield = analytics.harvestSummary.yield_per_harvested_hectare || 0;
    const sownYield = analytics.harvestSummary.yield_per_sown_hectare || 0;
    const estimatedYield = analytics.harvestSummary.average_estimated_yield || 0;
    const realVsProjected = analytics.harvestSummary.yield_real_vs_projected || 0;
    const harvestedHectares = analytics.harvestSummary.total_harvested_hectares || 0;
    const totalHectares = analytics.harvestSummary.total_hectares || 1;
    const progress = (harvestedHectares / totalHectares) * 100;
    
    let percentageDeviation = 0;
    if (estimatedYield > 0) {
        percentageDeviation = ((harvestedYield / estimatedYield) - 1) * 100;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-stretch gap-6 animate-fade-in">
            {/* Tarjeta de Resumen Principal */}
            <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold text-text-primary mb-4">Resumen de Cosecha</h3>
                <div className="flex flex-col items-center text-center py-4">
                    <Scale className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-text-secondary">Kg Totales Cosechados</p>
                    <p className="text-4xl font-bold text-primary-dark tracking-tight">
                        {formatNumber(totalKg)}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                        {formatNumber(totalKg / 1000, 1)} toneladas
                    </p>
                </div>
                <hr className="my-4 border-gray-100" />
                <div className="grid grid-cols-2 gap-4 text-center mt-auto">
                    <div className="flex flex-col items-center">
                        <Tractor className="w-6 h-6 text-primary-dark mb-1" />
                        <p className="text-sm text-text-secondary">Rinde Cosechado</p>
                        <p className="text-2xl font-semibold text-text-primary">
                            {formatNumber(harvestedYield)}
                            <span className="text-base font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Leaf className="w-6 h-6 text-blue-600 mb-1" />
                        <p className="text-sm text-text-secondary">Rinde Sembrado</p>
                        <p className="text-2xl font-semibold text-text-primary">
                            {formatNumber(sownYield)}
                            <span className="text-base font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                </div>
            </Card>

            {/* Tarjeta de Avance de Cosecha */}
            <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold text-text-primary mb-4">Avance de Cosecha</h3>
                <div className="flex flex-col items-center text-center py-4">
                    <TrendingUp className="w-8 h-8 text-primary-dark mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-text-secondary">Progreso Completado</p>
                    <p className="text-4xl font-bold text-primary-dark tracking-tight">
                        {formatNumber(progress, 1)}%
                    </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className="bg-primary-dark h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="text-center mt-auto">
                    <p className="text-text-secondary text-sm">
                        <span className="font-semibold">{formatNumber(harvestedHectares)} ha</span> de{' '}
                        <span className="font-semibold">{formatNumber(totalHectares)} ha</span>
                    </p>
                </div>
            </Card>

            {/* Tarjeta de Análisis de Rendimiento */}
            {estimatedYield > 0 && (
                <Card className="p-6 h-full flex flex-col lg:col-span-2 xl:col-span-1">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Análisis de Rendimiento</h3>
                    <div className="flex flex-col items-center text-center py-4">
                        <Target className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                        <p className="text-sm text-text-secondary">Desvío s/ Estimado</p>
                        <p className={`text-4xl font-bold tracking-tight ${percentageDeviation >= 0 ? 'text-primary-dark' : 'text-red-600'}`}>
                            {percentageDeviation > 0 ? '+' : ''}{formatNumber(percentageDeviation, 1)}%
                        </p>
                        <p className={`mt-1 text-sm font-medium ${percentageDeviation >= 0 ? 'text-primary-dark' : 'text-red-600'}`}>
                            ({realVsProjected >= 0 ? '+' : ''}{formatNumber(realVsProjected)} kg/ha)
                        </p>
                    </div>
                    <hr className="my-4 border-gray-100" />
                    <div className="grid grid-cols-2 gap-4 text-center mt-auto">
                        <div className="flex flex-col items-center">
                            <Tractor className="w-6 h-6 text-primary-dark mb-1" />
                            <p className="text-sm text-text-secondary">Rinde Real</p>
                            <p className="text-2xl font-semibold text-text-primary">
                                {formatNumber(harvestedYield)}
                                <span className="text-base font-normal text-gray-400"> kg/ha</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ClipboardCheck className="w-6 h-6 text-gray-500 mb-1" />
                            <p className="text-sm text-text-secondary">Rinde Estimado</p>
                            <p className="text-2xl font-semibold text-text-primary">
                                {formatNumber(estimatedYield)}
                                <span className="text-base font-normal text-gray-400"> kg/ha</span>
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default HarvestSection;