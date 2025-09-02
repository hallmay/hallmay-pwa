import { Edit, Tractor } from "lucide-react";
import { type FC, useState } from "react";
import { useOutletContext } from "react-router";
import Button from "../../shared/components/commons/Button";
import Card from "../../shared/components/commons/Card";
import ManageHarvestersModal from "./components/modals/ManageHarvestersModal";
import { upsertHarvesters } from "./services/harvestSession";
import toast from "react-hot-toast";
import { formatNumber } from "../../shared/utils";
import ScrollableContainer from "../../shared/components/commons/ScrollableContainer";

const HarvestersTab: FC = () => {
    const { harvestSession } = useOutletContext<{ harvestSession: { id: string; harvesters?: Array<{ id: string; name: string; harvested_hectares?: number }> } }>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditSubmit = async (data: { harvesters: Array<{ id: string; name: string }> }) => {
        upsertHarvesters({
            harvestSessionId: harvestSession.id,
            harvestersFormData: data.harvesters
        }).catch(error => {
            toast.error("Error al actualizar los cosecheros.");
            console.error("Error al actualizar los cosecheros:", error);
        })
        toast.success("Cosecheros actualizados con éxito.");
        setIsEditModalOpen(false);
};

const totalHarvestedHectares = harvestSession.harvested_hectares || 0;

return (
    <>
        {isEditModalOpen && (
            <ManageHarvestersModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                harvestSession={harvestSession}
            />
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Cosecheros Asignados</h3>
                <Button variant="ghost" icon={Edit} aria-label="Editar Cosecheros" onClick={() => setIsEditModalOpen(true)} />
            </div>
            <ScrollableContainer maxHeight="70vh" showScrollbarOnDesktop={false}>
                <div className="space-y-4">
                    {harvestSession.harvesters && harvestSession.harvesters.length > 0 ? (
                        harvestSession.harvesters.map((h, i: number) => {
                            const contribution = totalHarvestedHectares > 0
                                ? ((h.harvested_hectares || 0) / totalHarvestedHectares) * 100
                                : 0;

                            return (
                                // CAMBIO: Se añaden las clases de borde y sombra
                                <Card key={h.id || i} className="bg-white border">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">

                                        {/* --- 1. Identidad --- */}
                                        <div className="flex items-center gap-4 sm:w-1/3">
                                            <div className="bg-primary-light p-3 rounded-full">
                                                <Tractor size={20} className="text-primary-dark" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{h.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {h.plot_map ? 'Con mapeo de lote' : 'Sin mapeo de lote'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* --- 2. Hectáreas Cosechadas (Métrica Principal) --- */}
                                        <div className="py-4 sm:py-0 sm:w-1/3 text-center border-y sm:border-y-0 sm:border-x border-gray-200 my-4 sm:my-0">
                                            <p className="text-3xl font-bold text-primary">{formatNumber(h.harvested_hectares || 0)}</p>
                                            <p className="text-xs text-text-secondary -mt-1">Hectáreas Asignadas</p>
                                        </div>

                                        {/* --- 3. Contribución al Total --- */}
                                        <div className="sm:w-1/3 flex flex-col items-center">
                                            <div className="w-full">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-sm font-medium text-text-secondary">Contribución al Total</span>
                                                    <span className="text-sm font-bold text-primary-dark">{contribution.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div style={{ width: `${contribution}%` }} className="h-full bg-primary-darker rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <p>No hay cosecheros asignados a este lote.</p>
                        </div>
                    )}
                </div>
            </ScrollableContainer>
        </div>
    </>
);
};

export default HarvestersTab;