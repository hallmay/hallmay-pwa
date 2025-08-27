import type { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";
import { useHarvestManagers } from "../../../../shared/hooks/harvest-manager/useHarvestManagers";
import { updateHarvestManager } from "../../services/harvestSession";
import type { HarvestSession } from "../../../../shared/types";
import toast from "react-hot-toast";
import Select from "../../../../shared/components/form/Select";

const EditManagerModal: FC<{
    session: HarvestSession,
    isOpen: boolean,
    onClose: () => void
}> = ({ session, isOpen, onClose }) => {
    const { harvestManagers } = useHarvestManagers();
    const { control, handleSubmit } = useForm({
        defaultValues: {
            managerId: session.harvest_manager.id || ''
        }
    });

    const handleEditManagerSubmit = async (data: { managerId: string }) => {
        const selectedManager = harvestManagers?.find(m => m.id === data.managerId);
        updateHarvestManager(session.id, { id: selectedManager?.id, name: selectedManager?.name }).catch(_error => {
            toast.error("Error al cambiar el responsable")
        });
        onClose()
        toast.success("Se actualizo el responsable con éxito");
    };

    const managerOptions = harvestManagers.map(m => ({ id: m.id, name: m.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Responsable">
            <form onSubmit={handleSubmit(handleEditManagerSubmit)} className="space-y-6">
                <Controller
                    name="managerId"
                    control={control}
                    rules={{ required: 'Debe seleccionar un responsable.' }}
                    render={({ field, fieldState: { error } }) => (
                        <Select
                            {...field}
                            label="Responsable de Cosecha"
                            items={managerOptions}
                            placeholder="Seleccionar responsable..."
                            error={error?.message}
                        />
                    )}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditManagerModal