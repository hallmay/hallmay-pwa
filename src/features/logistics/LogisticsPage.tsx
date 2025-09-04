import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import PageHeader from "../../shared/components/layout/PageHeader";
import { useLogistics } from "./hooks/useLogistics";
import { useCampaignFields } from "../../shared/hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../shared/hooks/campaign/useActiveCampaign";
import { useCrops } from "../../shared/hooks/crop/useCrops";
import { updateLogisticsStatus } from "./services/logistics";
import type { Logistics as LogisticsType } from "../../shared/types";
import { PlusCircle } from "lucide-react";
import Button from "../../shared/components/commons/Button";
import toast from "react-hot-toast";
import AddTruckModal from "./components/modals/AddTruckModal";
import UpdateStatusModal from "./components/modals/UpdateStatusModal";
import LogisticsFilters from "./components/LogisticsFilters";
import LogisticsBoard from "./components/LogisticsBoard";
import PageLoader from "../../shared/components/layout/PageLoader";

const Logistics = () => {
    const [modal, setModal] = useState<'add' | 'update' | null>(null);
    const [selectedTruck, setSelectedTruck] = useState<LogisticsType | null>(null);
    const { control, watch } = useForm({
        defaultValues: {
            dateRange: {
                from: new Date(),
                to: new Date()
            },
            field: ''
        }
    });

    const selectedDateRange = watch('dateRange');
    const selectedField = watch('field');

    // Hooks de datos
    const { campaign } = useActiveCampaign();
    const { campaignFields, loading: loadingFields } = useCampaignFields();
    const { crops } = useCrops();
    const { logistics, loading: loadingLogistics } = useLogistics(
        selectedDateRange,
        selectedField,
        campaign?.id ?? ''
    );

    const statusOptions = [
        { value: 'in-route-to-field', label: 'En Camino a Campo', color: 'bg-blue-100 text-blue-800', shortLabel: 'En Camino' },
        { value: 'in-field', label: 'En campo', color: 'bg-yellow-100 text-yellow-800', shortLabel: 'En Campo' },
        { value: 'closed', label: 'Entregado', color: 'bg-grey-100 text-grey-800', shortLabel: 'Entregado' },

    ];

    const suggestedOrderNumber = useMemo(() => {
        const dateToUse = selectedDateRange.to || new Date();
        const datePrefix = format(dateToUse, 'ddMM');
        const ordersForDay = logistics.filter((truck: LogisticsType) => {
            const truckDate = truck.date.toDate();
            return truckDate && format(truckDate, 'ddMM') === datePrefix;
        });
        const nextNumber = ordersForDay.length + 1;
        return `ORD-${datePrefix}-${String(nextNumber).padStart(3, '0')}`;
    }, [selectedDateRange.to, logistics]);


    const organizedTasks = useMemo(() => {
        const initial: Record<string, LogisticsType[]> = Object.fromEntries(
            statusOptions.map(s => [s.value, [] as LogisticsType[]])
        ) as Record<string, LogisticsType[]>;

        (logistics as unknown as LogisticsType[]).forEach((truck) => {
            (initial[truck.status] ||= []).push(truck);
        });

        return initial;
    }, [logistics, statusOptions]);

    const handleStatusChange = async (truckId: string, newStatus: string) => {
        updateLogisticsStatus(truckId, newStatus).catch(error => {
            console.error('Error al actualizar estado:', error);
            toast.error("No se pudo actualizar el estado.");
        });
        toast.success(`Estado actualizado con exito`);
        setSelectedTruck(null);
        setModal(null);

    };

    const openUpdateModal = (truck: LogisticsType) => {
        setSelectedTruck(truck);
        setModal('update');
    };

    if (loadingLogistics || loadingFields) {
        return <PageLoader title="Logística" breadcrumbs={[{ label: 'Logística' }]} message="Cargando órdenes..." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Logística" breadcrumbs={[{ label: 'Logística' }]}>
                <Button icon={PlusCircle} onClick={() => setModal('add')}>Agregar Camión</Button>
            </PageHeader>


            <LogisticsFilters
                control={control}
                selectedField={selectedField}
                campaignFields={campaignFields}
                loadingFields={loadingFields}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-0">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estado de Camiones</h3>
                
                <div className="md:hidden mb-4">
                    <p className="text-xs text-gray-500 text-center">← Desliza para ver más estados →</p>
                </div>

                <LogisticsBoard
                    organizedTasks={organizedTasks}
                    statusOptions={statusOptions}
                    openUpdateModal={openUpdateModal}
                />
            </div>

            {campaign && (
                <AddTruckModal
                    isOpen={modal === 'add'}
                    onClose={() => setModal(null)}
                    fields={campaignFields}
                    crops={crops}
                    campaign={campaign}
                    suggestedOrderNumber={suggestedOrderNumber}
                />
            )}

            <UpdateStatusModal
                isOpen={modal === 'update'}
                onClose={() => setModal(null)}
                selectedTruck={selectedTruck}
                statusOptions={statusOptions}
                handleStatusChange={handleStatusChange} />
        </div>
    );
};

export default Logistics;