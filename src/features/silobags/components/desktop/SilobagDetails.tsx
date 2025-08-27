import { TrendingDown, TrendingUp } from "lucide-react";
import type { FC } from "react";
import type { Silobag } from "../../../../shared/types";
import { formatNumber } from "../../../../shared/utils";
import SiloBagMetrics from "../SilobagMetrics";

const SiloBagDetailsDesktop: FC<{ siloBag: Silobag }> = ({ siloBag }) => (
    <div className="hidden md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
        <div className="p-6 text-left">
            <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
            {siloBag.status === 'closed' && siloBag.difference_kg && siloBag.difference_kg !== 0 && (
                <div className={`inline-flex text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full ${siloBag.difference_kg > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {siloBag.difference_kg > 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    <span>
                        {formatNumber(Math.abs(siloBag.difference_kg))} kg de {siloBag.difference_kg > 0 ? 'menos' : 'mas'}
                    </span>
                </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-text-secondary">Estado</p>
                    <p className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{siloBag.status === 'active' ? 'Activo' : 'Cerrado'}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Cultivo</p>
                    <p className="font-semibold text-text-primary">{siloBag.crop.name}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Campo</p>
                    <p className="font-semibold text-text-primary">{siloBag.field.name}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Ubicación / Lote</p>
                    <p className="font-semibold text-text-primary">{siloBag.location ? siloBag.location : '-'}</p>
                </div>
            </div>
        </div>
        <div className="p-6 flex flex-col justify-center text-left">
            <SiloBagMetrics siloBag={siloBag} />
        </div>
    </div>
);

export default SiloBagDetailsDesktop;