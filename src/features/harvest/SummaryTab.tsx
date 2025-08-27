import type { FC } from "react";
import { useOutletContext } from "react-router";
import { Scale, Tractor, Leaf, Target, ClipboardCheck } from "lucide-react"; // Se agregan nuevos íconos

import Card from "../../shared/components/commons/Card";
import { formatNumber } from "../../shared/utils";

const SummaryTab: FC = () => {
    const { harvestSession } = useOutletContext<any>();

    const totalKg = harvestSession.total_kgs || harvestSession.harvested_kgs || 0;
    const harvestedYield = harvestSession.yields?.harvested || 0;
    const sownYield = harvestSession.yields?.seed || 0;
    const estimatedYield = harvestSession.estimated_yield;
    const realVsProjected = harvestSession.yields?.real_vs_projected || 0;
    let percentageDeviation = 0;
    if (estimatedYield > 0) {
        percentageDeviation = ((harvestedYield / estimatedYield) - 1) * 100;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6">

            {/* 1. Tarjeta de Resumen (Sin cambios) */}
            <Card className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold text-text-primary mb-4">Resumen de Cosecha</h3>
                <div className="flex flex-col items-center text-center py-4">
                    <Scale className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-text-secondary">Kg Totales Cosechados</p>
                    <p className="text-4xl font-bold text-primary-dark tracking-tight">
                        {formatNumber(totalKg)}
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

            {estimatedYield > 0 && (
                <Card className="p-6 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Análisis de Rendimiento</h3>

                    <div className="flex flex-col items-center text-center py-4">
                        <Target className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                        <p className="text-sm text-text-secondary">Desvío s/ Estimado</p>
                        {/* Se usa la nueva variable "percentageDeviation" */}
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

export default SummaryTab;