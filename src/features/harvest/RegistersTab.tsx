import { format } from "date-fns";
import { PlusCircle, Truck, Archive, Edit, Trash2, Scale, Droplets, MapPin, User } from "lucide-react";
import { type FC } from "react";
import { useOutletContext } from "react-router";
import Button from "../../shared/components/commons/Button";
import Card from "../../shared/components/commons/Card";
import { formatNumber } from "../../shared/utils";
import { useRegisterManager } from "./hooks/useHarvestSessionRegisterManager";
import AddRegisterModal from "./components/modals/AddRegisterModal";
import DeleteRegisterModal from "./components/modals/DeleteRegisterModal";
import EditRegisterModal from "./components/modals/EditRegisterModal";
import ScrollableContainer from "../../shared/components/commons/ScrollableContainer";
import useAuth from "../../shared/context/auth/AuthContext";

const RegistersTab: FC = () => {
    // Obtenemos los datos del contexto del Outlet
    const { registers, harvestSession } = useOutletContext<{ 
        registers: Array<{ id: string; [key: string]: any }>;
        harvestSession: { id: string; [key: string]: any };
    }>();
    const {currentUser} = useAuth();

    // Centralizamos toda la lógica en el hook
    const { selectedRegister, modal, handlers, ui, siloBags, destinations } = useRegisterManager(harvestSession);

    return (
        <>
            <AddRegisterModal
                isOpen={modal === 'add'}
                onClose={ui.closeModal}
                onSubmit={handlers.add}
                siloBags={siloBags}
                destinations={destinations}
            />
            {selectedRegister && (
                <>
                    <EditRegisterModal
                        isOpen={modal === 'edit'}
                        onClose={ui.closeModal}
                        onSubmit={handlers.update}
                        register={selectedRegister}
                        siloBags={siloBags}
                        destinations={destinations}
                    />
                    <DeleteRegisterModal
                        isOpen={modal === 'delete'}
                        onClose={ui.closeModal}
                        onConfirm={handlers.delete}
                    />
                </>
            )}

            {/* Contenido de la UI */}
            <div className="space-y-6">
                {currentUser?.role !== 'field-owner' &&
                    <div className="flex justify-center mt-4">
                    <Button
                        className="w-full md:w-1/2"
                        icon={PlusCircle}
                        onClick={() => ui.openModal('add')}
                    >
                        Añadir Nuevo Registro
                    </Button>
                </div>
                }
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Registros de Cosecha</h3>
                    <ScrollableContainer maxHeight="65vh" showScrollbarOnDesktop={false}>
                        {registers && registers.length > 0 ? (
                            <>
                                <div className="hidden md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b-2 border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Kgs</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">ID/Patente</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {registers.map((reg: any) => (
                                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 whitespace-nowrap">{format(reg.date.toDate(), 'dd/MM/yyyy HH:mm')}</td>
                                                    <td className="p-3"><div className="flex items-center gap-2">{reg.type === 'truck' ? <Truck size={16} className="text-gray-500" /> : <Archive size={16} className="text-gray-500" />}<span>{reg.type === 'truck' ? 'Camión' : 'Silo Bolsa'}</span></div></td>
                                                    <td className="p-3 text-right font-medium text-gray-800">{formatNumber(reg.weight_kg)}</td>
                                                    <td className="p-3 font-mono">{reg.truck?.license_plate || reg.silo_bag?.name || '-'}</td>
                                                    <td className="p-3">{reg.truck?.driver || '-'}</td>
                                                    <td className="p-3">{reg.destination?.name || reg.silo_bag?.location || '-'}</td>
                                                    <td className="p-3"><div className="flex gap-1"><Button variant="ghost" aria-label="Editar" onClick={() => ui.openModal('edit', reg)}><Edit size={16} /></Button><Button variant="ghost" aria-label="Eliminar" onClick={() => ui.openModal('delete', reg)}><Trash2 size={16} className="text-red-500 hover:text-red-700" /></Button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden space-y-4">
                                    {registers.map((reg: any) => (
                                        <Card key={reg.id} className="bg-white border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-3 rounded-full">
                                                        {reg.type === 'truck' ? <Truck size={20} className="text-blue-600" /> : <Archive size={20} className="text-blue-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{reg.truck?.license_plate || reg.silo_bag?.name}</p>
                                                        <p className="text-xs text-gray-500">{reg.date ? format(new Date(reg.date.seconds * 1000), 'dd/MM/yyyy HH:mm') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex -mr-2 -mt-2">
                                                    <Button variant="ghost" onClick={() => ui.openModal('edit', reg)}><Edit size={16} /></Button>
                                                    <Button variant="ghost" onClick={() => ui.openModal('delete', reg)}><Trash2 size={16} className="text-red-500" /></Button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2"><Scale size={14} className="text-gray-400" /><p><span className="font-semibold">{formatNumber(reg.weight_kg)}</span> kg</p></div>
                                                <div className="flex items-center gap-2"><Droplets size={14} className="text-gray-400" /><p><span className="font-semibold">{reg.humidity || 0}</span> %</p></div>
                                                {reg.type === 'truck' ? (
                                                    <>
                                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.destination?.name || 'N/A'}</p></div>
                                                        <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /><p>{reg.truck?.driver || 'N/A'}</p></div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.silo_bag?.location || 'N/A'}</p></div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (<div className="text-center text-gray-500 py-8"><p>No hay registros de cosecha para este lote.</p></div>)}
                    </ScrollableContainer>
                </div>
            </div>
        </>
    );
};

export default RegistersTab;