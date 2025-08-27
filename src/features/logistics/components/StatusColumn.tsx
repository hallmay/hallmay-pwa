import { Truck } from "lucide-react";
import Card from "../../../shared/components/commons/Card";
import TruckCard from "./TruckCard";
import ScrollableContainer from "../../../shared/components/commons/ScrollableContainer";

const StatusColumn = ({ status, trucks, openUpdateModal }) => (
    <div className="flex-shrink-0 w-72 md:flex-1 md:w-auto">
        <Card className="p-3 mb-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">{status.shortLabel}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{trucks.length}</span>
            </div>
        </Card>

        <div className="space-y-0 flex-1 overflow-hidden min-h-0">
            <ScrollableContainer maxHeight="65vh" showScrollbarOnDesktop={false}>
                <div className="space-y-2">
                    {trucks.length > 0 ? (
                        trucks.map(truck => <TruckCard key={truck.id} truck={truck} isCompact openUpdateModal={openUpdateModal} />)
                    ) : (
                        <Card className="p-6 text-center border-2 border-dashed border-gray-200">
                            <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No hay camiones</p>
                        </Card>
                    )}
                </div>
            </ScrollableContainer>
        </div>
    </div>
);

export default StatusColumn;