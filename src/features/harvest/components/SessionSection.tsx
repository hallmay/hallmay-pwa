// src/components/harvest-session/ui/PlotSection.tsx
import { type FC, memo } from "react";
import Card from "../../../shared/components/commons/Card";
import type { HarvestSession } from "../../../shared/types";
import StatusBadge from "../../../shared/components/commons/StatusBadge";
import ScrollableContainer from "../../../shared/components/commons/ScrollableContainer";

interface SessionSectionProps {
    harvestSessions: HarvestSession[];
    onViewLot: (lot: HarvestSession) => void;
    loading?: boolean;
}

const SessionCard = memo<{ harvestSession: HarvestSession; onClick: (harvestSession: HarvestSession) => void }>(({
    harvestSession,
    onClick
}) => {
    // Calcular progreso
    const progress = harvestSession.harvested_hectares && harvestSession.hectares
        ? Math.round((harvestSession.harvested_hectares / harvestSession.hectares) * 100)
        : 0;

    return (
        <Card
            onClick={() => onClick(harvestSession)}
            className="flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-text-primary">
                        Lote {harvestSession.plot?.name || 'Sin nombre'}
                    </h3>
                    <StatusBadge status={harvestSession.status} />
                </div>
                <p className="text-sm text-text-secondary">
                    {harvestSession.crop?.name || 'Sin cultivo'} - {harvestSession.field?.name || 'Sin campo'}
                </p>

                {/* Información adicional */}
                <div className="mt-2 text-xs text-text-secondary">
                    <p>Hectáreas: {harvestSession.hectares || 0} ha</p>
                    <p>Cosechadas: {harvestSession.harvested_hectares || 0} ha</p>
                    {harvestSession.total_kgs && (
                        <p>Total: {(harvestSession.total_kgs / 1000).toFixed(1)} tn</p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-text-secondary">Avance</span>
                    <span className="text-sm font-bold text-primary-darker">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        className="h-full bg-primary-darker transition-all duration-500"
                    ></div>
                </div>
            </div>
        </Card>
    );
});

SessionCard.displayName = 'SessionCard';

const SessionSection: FC<SessionSectionProps> = ({ harvestSessions, onViewLot, loading }) => {
    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-text-secondary">Cargando lotes en cosecha...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-0">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Lotes en Cosecha</h3>
            <ScrollableContainer maxHeight="65vh" showScrollbarOnDesktop={false}>
                {harvestSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {harvestSessions.map(hs => (
                            <SessionCard
                                key={hs.id}
                                harvestSession={hs}
                                onClick={onViewLot}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-text-secondary">No se encontraron lotes en cosecha.</p>
                    </div>
                )}
            </ScrollableContainer>
        </div>
    );
};

export default SessionSection;