import type { FC } from "react";
import type { Silobag } from "../../../shared/types";
import { formatNumber } from "../../../shared/utils";

const SiloBagMetrics: FC<{ siloBag: Silobag }> = ({ siloBag }) => {
    const fillPercentage = siloBag.initial_kg > 0 ? (siloBag.current_kg / siloBag.initial_kg) * 100 : 0;
    return (
        <div>
            <p className="text-sm text-text-secondary">Kgs Actuales</p>
            <p className="text-4xl font-bold text-primary">{formatNumber(siloBag.current_kg)}</p>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary-darker h-2.5 rounded-full" style={{ width: `${fillPercentage}%` }}></div>
                </div>
                <p className="text-xs text-right text-text-secondary mt-1">
                    Capacidad Inicial: {formatNumber(siloBag.initial_kg)} kgs
                </p>
            </div>
        </div>
    );
};

export default SiloBagMetrics;