import { useForm } from 'react-hook-form';
import type { HarvestSession } from '../../../../shared/types';
import Modal from '../../../../shared/components/commons/Modal';
import Button from '../../../../shared/components/commons/Button';
import Input from '../../../../shared/components/form/Input';
import { useEffect, useMemo } from 'react';

interface UpdateAdvanceFormData {
    harvested_hectares: number;
}

interface UpdateAdvanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    harvestSession: HarvestSession;
    onAdvance: (newTotalHarvested: number) => void; // sólo recalcula/avanza
}

const UpdateAdvanceModal: React.FC<UpdateAdvanceModalProps> = ({
    isOpen,
    onClose,
    harvestSession,
    onAdvance
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset
    } = useForm<UpdateAdvanceFormData>({
        defaultValues: {
            harvested_hectares: harvestSession.harvested_hectares || 0
        }
    });
    const watchedHectares = watch('harvested_hectares');
    const current = harvestSession.harvested_hectares || 0;
    const max = harvestSession.hectares || 0;
    const delta = useMemo(() => watchedHectares - current, [watchedHectares, current]);
    const alreadyFinished = harvestSession.status === 'finished';

    // Auto clamp if greater than max (user can type bigger then slider range)
    useEffect(() => {
        if (watchedHectares > max) {
            reset({ harvested_hectares: max });
        }
    }, [watchedHectares, max, reset]);

    const submitAdvance = (data: UpdateAdvanceFormData) => {
        onAdvance(data.harvested_hectares);
        reset({ harvested_hectares: data.harvested_hectares });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Avance de Cosecha">
            <form onSubmit={handleSubmit(submitAdvance)} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-end justify-between">
                            <label className="block text-sm font-medium text-text-primary mb-1">Hectáreas Cosechadas (ha)</label>
                            <span className="text-xs text-text-secondary">Máx: {max}</span>
                        </div>
                        <Input
                            type="number"
                            placeholder="Ej: 25"
                            {...register('harvested_hectares', {
                                required: 'Las hectáreas son obligatorias.',
                                valueAsNumber: true,
                                min: { value: 0, message: 'Debe ser un número positivo.' },
                                max: {
                                    value: max,
                                    message: `No puede superar las ${max} ha del lote.`
                                },
                                validate: (v) => v >= current || 'No puede ser menor al avance actual.'
                            })}
                            error={errors.harvested_hectares?.message}
                        />
                        <div className="mt-2 text-xs flex justify-between text-text-secondary">
                            <span>Actual: {current} ha</span>
                            <span>Nuevo: {watchedHectares || 0} ha</span>
                        </div>
                        <div className="mt-1 text-xs font-medium">
                            {delta > 0 && <span className="text-primary-darker">+{delta.toFixed(1)} ha</span>}
                            {delta === 0 && <span className="text-text-secondary">Sin cambio</span>}
                        </div>
                        <p className="text-xs text-text-secondary leading-snug mt-2">
                            {alreadyFinished
                                ? 'La sesión está finalizada. El avance es de solo lectura.'
                                : harvestSession.status === 'pending' && current === 0 && watchedHectares > 0
                                    ? 'Al guardar, la sesión pasará automáticamente a En Progreso.'
                                    : 'Ingresa o ajusta el total acumulado de hectáreas.'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <Button
                        className="w-1/2"
                        variant="outline"
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="w-1/2"
                        type="submit"
                        disabled={alreadyFinished || !!errors.harvested_hectares || delta < 0}
                        isLoading={isSubmitting}
                    >
                        {alreadyFinished ? 'Finalizado' : 'Guardar Avance'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateAdvanceModal;