import { format } from "date-fns";
import { PlusCircle, ArrowDown, ArrowUp, AlertTriangle, XCircle, ChevronsRight } from "lucide-react";
import type { FC } from "react";
import type { SilobagMovement } from "../../../../shared/types";
import { formatNumber } from "../../../../shared/utils";
import MovementTypeBadge from "../MovementTypeBadge";

const MovementsListDesktop: FC<{ movements: SilobagMovement[] }> = ({ movements }) => {
    const movementVisuals = {
        creation: { icon: PlusCircle, color: "text-blue-500" },
        harvest_entry: { icon: ArrowUp, color: "text-green-600" },
        substract: { icon: ArrowDown, color: "text-red-500" },
        loss: { icon: AlertTriangle, color: "text-yellow-600" },
        close: { icon: XCircle, color: "text-gray-500" },
        default: { icon: ChevronsRight, color: "text-gray-500" },
    };

    return (
        <div className="hidden md:block">
            <div className="divide-y divide-gray-100">
                {movements.map((mov) => {
                    const visual = movementVisuals[mov.type] || movementVisuals.default;
                    const Icon = visual.icon;
                    return (
                        <div key={mov.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
                            <div className="flex items-center gap-3 w-64">
                                <div className={`p-2 rounded-full ${visual.color}`}><Icon size={20} /></div>
                                <MovementTypeBadge type={mov.type} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-text-primary">{mov.details || "Sin descripción"}</p>
                                <p className="text-sm text-text-secondary">{format(mov.date.toDate(), 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${mov.kg_change > 0 ? 'text-green-600' : 'text-red-600'}`}>{mov.kg_change > 0 ? '+' : ''}{formatNumber(mov.kg_change)}</p>
                                <p className="text-sm text-text-secondary">kgs</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MovementsListDesktop;