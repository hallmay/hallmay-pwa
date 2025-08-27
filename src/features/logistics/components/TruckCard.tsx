import { format } from "date-fns";
import {
    ChevronRight,
    MessageSquare,
    Wheat,
    Map,
    Truck,
    User
} from "lucide-react";
import type { Logistics } from "../../../shared/types";
import Card from "../../../shared/components/commons/Card";

// Componente helper (sin cambios)
const InfoBlock = ({ icon: Icon, label, value, colorClass = 'text-gray-500' }) => (
    <div>
        <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${colorClass}`} />
            <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p className="font-semibold text-sm text-gray-800 truncate" title={value}>
            {value || 'No especificado'}
        </p>
    </div>
);


const TruckCard = ({ truck, isCompact = false, openUpdateModal }: { truck: Logistics, isCompact?: boolean, openUpdateModal }) => (
    <Card
        className={`${isCompact ? 'p-4' : 'p-5'} mb-3 cursor-pointer hover:shadow-lg hover:border-primary-light transition-all duration-200 group`}
        onClick={() => openUpdateModal(truck)}
    >
        {/* --- Encabezado --- */}
        {/* CAMBIO: Se movió la fecha aquí */}
        <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-gray-900">
                Camión Nro. {truck.order}
            </div>
            <span className="text-sm font-medium text-gray-500">{format(truck.date.toDate(), 'dd/MM/yyyy')}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoBlock icon={Map} label="Campo" value={truck.field?.name} colorClass="text-red-500" />
            <InfoBlock icon={Truck} label="Logística" value={truck.company} colorClass="text-gray-500" />
            <InfoBlock icon={Wheat} label="Cultivo" value={truck.crop?.name} colorClass="text-yellow-600" />
            <InfoBlock icon={User} label="Conductor" value={truck.driver} colorClass="text-green-600" />
        </div>

        {truck.details && (
            <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-start gap-2 text-gray-600">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
                    <p className="text-sm">
                        {truck.details}
                    </p>
                </div>
            </div>
        )}

        <div className="flex justify-end mt-2 -mb-1 -mr-1">
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary" />
        </div>
    </Card>
);

export default TruckCard;