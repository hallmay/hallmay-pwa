import type { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import useAuth from "../../../../shared/context/auth/AuthContext";
import type { CampaignField, Crop, Logistics } from "../../../../shared/types";
import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";
import { Timestamp } from "firebase/firestore";
import { addLogisticsOrder } from "../../services/logistics";
import Input from "../../../../shared/components/form/Input";
import DateInput from "../../../../shared/components/form/DateInput";
import Select from "../../../../shared/components/form/Select";
import TextArea from "../../../../shared/components/form/TextArea";

const AddTruckModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    fields: Partial<CampaignField>[];
    crops: Crop[];
    suggestedOrderNumber: string;
}> = ({ isOpen, onClose, fields, crops, suggestedOrderNumber }) => {
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            order: suggestedOrderNumber,
            date: new Date(),
            fieldId: '',
            cropId: '',
            driver: '',
            company: '',
            details: ''
        }
    });
    const { currentUser } = useAuth();


    const onSubmit = async (data: any) => {
        const field = fields.find(cf => cf.field.id === data.fieldId)?.field;
        const crop = crops.find(c => c.id === data.cropId);
        const selectedDate = new Date(data.date);

        const newOrder: Partial<Logistics> = {
            order: data.order,
            date: Timestamp.fromDate(selectedDate),
            field: { id: field.id, name: field.name },
            crop: { id: crop.id, name: crop.name },
            driver: data.driver,
            company: data.company,
            details: data.details,
            organization_id: currentUser.organizationId,
        };

        addLogisticsOrder(newOrder).catch(_error => {
            toast.error("No se pudo crear la orden de logística.");
        });
        toast.success("Orden de logística creada con éxito.");
        reset();
        onClose();

    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nueva Orden de Camión">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="N° de Orden" {...register("order", { required: "Este campo es obligatorio." })} error={errors.order?.message as string} />
                    <Controller
                        name="date"
                        control={control}
                        rules={{ required: "La fecha es obligatoria." }}
                        render={({ field, fieldState: { error } }) => (
                            <DateInput
                                {...field}
                                label="Fecha de la Orden"
                                error={error?.message}
                            />
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Controller name="fieldId" control={control} rules={{ required: "El campo es obligatorio." }} render={({ field }) => (
                        <Select {...field} label="Campo" items={fields.map(cf => ({ id: cf.field.id, name: cf.field.name }))} placeholder="Seleccionar campo..." error={errors.fieldId?.message as string} />
                    )} />
                    <Controller name="cropId" control={control} rules={{ required: "El cultivo es obligatorio." }} render={({ field }) => (
                        <Select {...field} label="Cultivo" items={crops} placeholder="Seleccionar cultivo..." error={errors.cropId?.message as string} />
                    )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Empresa de Transporte" {...register("company", { required: "El nombre de la empresa es obligatorio." })} />
                    <Input label="Conductor" {...register("driver", { required: "El nombre del chofer es obligatorio." })} error={errors.driver?.message as string} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <TextArea label="Observaciones" {...register("details")} error={errors.details?.message as string} />
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        className="w-[30%]"
                        variant="outline"
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="w-[70%]"
                        variant="primary"
                        type="submit"
                    >
                        Agregar Orden
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTruckModal;