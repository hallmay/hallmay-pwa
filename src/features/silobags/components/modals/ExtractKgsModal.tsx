import { useForm, Controller, useWatch } from 'react-hook-form';
import Button from '../../../../shared/components/commons/Button';
import Modal from '../../../../shared/components/commons/Modal';
import type { Silobag } from '../../../../shared/types';
import { AlertTriangle } from 'lucide-react';
import Input from '../../../../shared/components/form/Input';
import TextArea from '../../../../shared/components/form/TextArea';

interface ExtractKgsModalProps {
    isOpen: boolean;
    onClose: () => void;
    siloBag: Silobag;
    onSubmit: (data: any) => Promise<void>;
}

const ExtractKgsModal: React.FC<ExtractKgsModalProps> = ({ isOpen, onClose, siloBag, onSubmit }) => {

    const { control, handleSubmit, formState: { isSubmitting }, reset } = useForm({
        defaultValues: {
            kgChange: '',
            details: ''
        },
        mode: 'onChange'
    });

    // 1. Obtenemos el valor en tiempo real
    const kgChangeValue = useWatch({
        control,
        name: 'kgChange',
    });

    // 2. Verificamos si excede el disponible
    const exceedsAvailable = parseFloat(kgChangeValue) > siloBag.current_kg;

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Extraer Kilos de ${siloBag.name}`}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Controller
                    name="kgChange"
                    control={control}
                    rules={{
                        required: "La cantidad es obligatoria.",
                        min: { value: 0.01, message: "Debe ser mayor a 0." },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            {...field}
                            label="Cantidad a Extraer (kg)"
                            type="number"
                            // El error se mostrará aquí de forma automática por react-hook-form
                            error={error?.message}
                        />
                    )}
                />

                {/* 4. Mostramos un cartel de aviso en tiempo real (mejorado visualmente) */}
                {exceedsAvailable && (
                    <div className="flex items-center gap-2 p-3 text-sm text-yellow-800 bg-yellow-50 rounded-lg -mt-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>El valor ingresado supera la cantidad disponible.</span>
                    </div>
                )}

                <Controller
                    name="details"
                    control={control}
                    rules={{ required: "El motivo es obligatorio." }}
                    render={({ field, fieldState: { error } }) => (
                        <TextArea
                            {...field}
                            label="Motivo / Descripción"
                            error={error?.message}
                        />
                    )}
                />
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleClose}
                        className="w-1/3"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        className="w-2/3"
                    >
                        Confirmar Extracción
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExtractKgsModal;