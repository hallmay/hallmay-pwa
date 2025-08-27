import { useForm, Controller } from 'react-hook-form';
import type { HarvestSession } from '../../../../shared/types';
import Modal from '../../../../shared/components/commons/Modal';
import Button from '../../../../shared/components/commons/Button';
import Select from '../../../../shared/components/form/Select';
import Input from '../../../../shared/components/form/Input';

interface UpdateAdvanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    harvestSession: HarvestSession;
}

const UpdateAdvanceModal: React.FC<UpdateAdvanceModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    harvestSession
}) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            harvested_hectares: harvestSession.harvested_hectares || 0,
            status: harvestSession.status,
        },
    });

    const statusOptions = [
        { id: 'pending', name: 'Pendiente' },
        { id: 'in-progress', name: 'En Progreso' },
        { id: 'finished', name: 'Finalizado' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Avance de Cosecha">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Estado"
                            items={statusOptions}
                            error={errors.status?.message}
                        />
                    )}
                />
                <Input
                    label="Hectáreas Cosechadas (ha)"
                    type="number"
                    {...control.register('harvested_hectares', {
                        required: 'Las hectáreas son obligatorias.',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Debe ser un número positivo.' },
                        max: {
                            value: harvestSession.hectares,
                            message: `No puede superar las ${harvestSession.hectares} ha del lote.`,
                        },
                    })}
                    error={errors.harvested_hectares?.message}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button className="w-[30%]" variant="outline" type="button" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button className="w-[70%]" type="submit">
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateAdvanceModal;