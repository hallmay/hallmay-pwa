// src/components/silobags/SiloBagCard.tsx
import { Link } from 'react-router';
import { MinusCircle, Archive, Lock, TrendingUp, TrendingDown } from 'lucide-react'; // Se añaden íconos
import Card from '../../../shared/components/commons/Card';
import { formatNumber } from '../../../shared/utils';
import Button from '../../../shared/components/commons/Button';
import { useMemo, memo } from 'react';
import type { Silobag } from '../../../shared/types';

interface SiloBagCardProps {
    silo: Silobag;
    onExtract: (e: React.MouseEvent) => void;
    onClose: (e: React.MouseEvent) => void;
}

const SiloBagCard = memo<SiloBagCardProps>(({ silo, onExtract, onClose }) => {
    const isClosed = silo.status === 'closed';

    const fillPercentage = useMemo(() => {
        if (!isClosed && silo.initial_kg > 0 && silo.current_kg > 0) {
            return (silo.current_kg / silo.initial_kg) * 100;
        }
        return 0;
    }, [isClosed, silo.current_kg, silo.initial_kg]);

    const hasDifference = isClosed && silo.difference_kg && silo.difference_kg !== 0;

    return (
        <Card className={`flex flex-col justify-between transition-all duration-300 group ${isClosed ? 'bg-gray-100 opacity-80' : 'bg-surface hover:shadow-md'}`}>
            <Link to={`/silo-bags/${silo.id}`} className="p-4 block grow">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className={`w-11 h-11 flex items-center justify-center rounded-lg ${isClosed ? 'bg-gray-200 text-gray-500' : 'bg-secondary text-white'}`}>
                            <Archive size={22} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-text-primary truncate group-hover:text-primary">
                                    {silo.name}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {silo.crop.name} <span className="text-gray-300 mx-1">•</span> {silo.field.name}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="font-bold text-lg text-primary">
                                    {/* CAMBIO: Muestra 0 si está cerrado, en lugar de "Cerrado" */}
                                    {isClosed ? '0' : formatNumber(silo.current_kg)}
                                </p>
                                <p className="text-xs text-text-secondary -mt-1">
                                    {isClosed ? 'kg' : 'kgs'}
                                </p>
                            </div>
                        </div>

                        {isClosed && hasDifference ? (
                            <div className="mt-2 space-y-1.5">
                                    <div className={`inline-flex text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full ${silo.difference_kg > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {silo.difference_kg > 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                        <span>
                                            {formatNumber(Math.abs(silo.difference_kg))} kg de {silo.difference_kg > 0 ? 'menos' : 'mas'}
                                        </span>
                                    </div>
                            </div>
                        ) : (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden" title={`${fillPercentage.toFixed(0)}%`}>
                                <div
                                    style={{ width: `${fillPercentage}%` }}
                                    className={'h-full rounded-full transition-all duration-500 bg-primary-darker'}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Las acciones no cambian */}
            {!isClosed && (
                <div className="flex border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-1/2 rounded-none rounded-bl-lg px-0 py-3 text-sm font-semibold flex items-center justify-center gap-2 text-text-secondary hover:bg-primary-lightest hover:text-primary active:bg-primary-light"
                        onClick={onExtract}
                        title="Extraer Kilos"
                        icon={MinusCircle}
                    >
                        <span>Extraer</span>
                    </Button>
                    <div className="border-l border-gray-100"></div>
                    <Button
                        variant="ghost"
                        className="w-1/2 rounded-none rounded-br-lg px-0 py-3 text-sm font-semibold flex items-center justify-center gap-2 text-text-secondary hover:bg-red-50 hover:text-red-600 active:bg-red-100"
                        onClick={onClose}
                        title="Cerrar Silo"
                        icon={Lock}
                    >
                        <span>Cerrar</span>
                    </Button>
                </div>
            )}
        </Card>
    );
});

SiloBagCard.displayName = 'SiloBagCard';

export default SiloBagCard;