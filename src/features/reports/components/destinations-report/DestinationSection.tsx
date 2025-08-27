import { Truck, Droplets, Weight, AlertCircle } from "lucide-react";
import type { FC } from "react";
import Card from "../../../../shared/components/commons/Card";
import { useOutletContext } from "react-router";
import { formatNumber } from "../../../../shared/utils";

// --- Componente para un único item de Destino (responsive) ---

const DestinationItem: FC<{ itemData: any, totalKgs: number }> = ({ itemData: item, totalKgs }) => {
    const percentage = totalKgs > 0 ? (item.total_kgs / totalKgs) * 100 : 0;

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-gray-200">

                {/* --- 1. Nombre y Barra de Progreso (siempre a la izquierda) --- */}
                <div className="md:pr-6 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-text-primary">{item.destination.name}</span>
                        <span className="text-sm font-semibold text-primary">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary-darker h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                {/* --- 2. Métrica Principal (ahora siempre centrada) --- */}
                <div className="py-4 md:py-0 md:px-6 flex flex-col justify-center items-center text-center">
                    <p className="text-3xl font-bold text-primary">{formatNumber(item.total_kgs)}</p>
                    <p className="text-xs text-text-secondary -mt-1">Kgs Totales</p>
                </div>

                {/* --- 3. KPIs Secundarios (a la derecha) --- */}
                <div className="pt-4 md:pt-0 md:pl-6 flex items-center justify-around border-t border-gray-200 md:border-t-0">
                    <div className="text-center" title="Total de Camiones">
                        <Truck size={20} className="mx-auto text-blue-500 mb-1" />
                        <p className="font-semibold text-text-primary">{item.truck_count}</p>
                        <p className="text-xs text-text-secondary">Viajes</p>
                    </div>
                    <div className="text-center" title="Promedio de Kgs por Camión">
                        <Weight size={20} className="mx-auto text-orange-500 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(item.average_kg_per_truck)}</p>
                        <p className="text-xs text-text-secondary">kg/viaje</p>
                    </div>
                    <div className="text-center" title="Humedad Promedio Ponderada">
                        <Droplets size={20} className="mx-auto text-teal-500 mb-1" />
                        <p className="font-semibold text-text-primary">{formatNumber(item.average_humidity, 1)}%</p>
                        <p className="text-xs text-text-secondary">Humedad</p>
                    </div>
                </div>

            </div>
        </Card>
    );
};

// --- Componente Principal de la Sección ---

export const DestinationsSection: FC = () => {
    const { analytics } = useOutletContext<any>();
    const totalKgs = analytics.destinationSummary.reduce((sum: number, item: any) => sum + item.total_kgs, 0);

    return (
        <div className="animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
                <Truck className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-text-primary">Entregas por Destino</h3>
            </div>

            {analytics.destinationSummary.length > 0 ? (
                // Se agrega un space-y para la separación entre las nuevas tarjetas
                <div className="space-y-4">
                    {analytics.destinationSummary
                        .sort((a: any, b: any) => b.total_kgs - a.total_kgs)
                        .map((item: any) => (
                            <DestinationItem key={item.id} itemData={item} totalKgs={totalKgs} />
                        ))}
                </div>
            ) : (
                <Card className="text-center py-10 text-text-secondary">
                    <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
                    <p>No hay datos de destinos para los filtros seleccionados.</p>
                </Card>
            )}
        </div>
    );
};

export default DestinationsSection;