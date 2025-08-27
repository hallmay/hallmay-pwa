import { Controller, useForm } from 'react-hook-form';
import Button from '../../../../shared/components/commons/Button';
import Modal from '../../../../shared/components/commons/Modal';
import type { Silobag } from '../../../../shared/types';
import TextArea from '../../../../shared/components/form/TextArea';


// --- 1. ACTUALIZAR LA INTERFAZ DE PROPS ---
interface CloseSiloBagModalProps {
    isOpen: boolean;
    onClose: () => void;
    siloBag: Silobag;
    onSubmit: (data: any) => Promise<void>;
}

const CloseSiloBagModal: React.FC<CloseSiloBagModalProps> = ({ isOpen, onClose, siloBag, onSubmit }) => {
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Cerrar ${siloBag.name}`}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <p>Estás a punto de cambiar el estado a <span className="font-bold">"Cerrado"</span>. Esta acción no se puede deshacer.</p>
                </div>
                <Controller
                    name="details"
                    control={control}
                    rules={{ required: "El detalle es obligatorio." }}
                    render={({ field }) => (
                        <TextArea
                            label="Detalle del Cierre"
                            placeholder="Ej: Fin de campaña, pudrición, etc."
                            {...field}
                            error={errors.details?.message as string}
                        />
                    )}
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button variant="danger" type="submit" isLoading={isSubmitting}>Confirmar Cierre</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CloseSiloBagModal;