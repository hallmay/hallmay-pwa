import { TrendingDown, TrendingUp } from "lucide-react";
import type { FC } from "react";
import type { Silobag } from "../../../../shared/types";
import { formatNumber } from "../../../../shared/utils";
import SiloBagMetrics from "../SilobagMetrics";

const SiloBagDetailsMobile: FC<{ siloBag: Silobag }> = ({ siloBag }) => (
    <div className="md:hidden text-center">
        <div>
            <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
            {siloBag.status === 'closed' && siloBag.difference_kg && siloBag.difference_kg !== 0 && (
                <div className={`inline-flex text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full ${siloBag.difference_kg > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {siloBag.difference_kg > 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    <span>
                        {formatNumber(Math.abs(siloBag.difference_kg))} kg de {siloBag.difference_kg > 0 ? 'menos' : 'mas'}
                    </span>
                </div>
            )}
            <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                <span>{siloBag.crop.name}</span>
                <span className="text-gray-300">•</span>
                <span>{siloBag.field.name}</span>
                <span className="text-gray-300">•</span>
                <span className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {siloBag.status === 'active' ? 'Activo' : 'Cerrado'}
                </span>
            </div>
            <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                <span>{siloBag.location ? siloBag.location : '-'}</span>
            </div>
        </div>
        <div className="border-t border-gray-200 my-4"></div>
        <SiloBagMetrics siloBag={siloBag} />
    </div>
);

export default SiloBagDetailsMobile;