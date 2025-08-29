import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { FC } from "react";
import type { SilobagMovement } from "../../../../shared/types";
import { formatNumber } from "../../../../shared/utils";
import MovementTypeBadge from "../MovementTypeBadge";

const MovementsListMobile: FC<{ movements: SilobagMovement[] }> = ({ movements }) => (
    <div className="md:hidden">
        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
            {movements.map((mov) => (
                <div key={mov.id} className="relative pl-8">
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${(mov.kg_change > 0) ? 'bg-green-500' : 'bg-red-500'}`}>
                        {mov.kg_change > 0 ? <ArrowUp size={12} className="text-white" /> : <ArrowDown size={12} className="text-white" />}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-primary"><MovementTypeBadge type={mov.type} /></span>
                        <span className="text-xs text-text-secondary">{format(mov.date.toDate(), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    {mov.type !== 'close' && <>
                        <p className={`text-lg font-bold ${mov.kg_change > 0 ? 'text-green-600' : 'text-red-600'}`}>{mov.kg_change > 0 ? '+' : ''}{formatNumber(mov.kg_change)}</p>
                        <p className="text-sm text-text-secondary">kgs</p>
                    </>
                    }
                    {mov.type === 'close' && mov.kg_change !== 0 &&
                        <>
                            <p className={`text-lg font-bold ${mov.kg_change > 0 ? 'text-red-600' : 'text-green-600'}`}>{mov.kg_change > 0 ? '-' : ''}{formatNumber(mov.kg_change)}</p>
                            <p className="text-sm text-text-secondary">kgs</p>
                        </>
                    }
                </div>
            ))}
        </div>
    </div>
);

export default MovementsListMobile;