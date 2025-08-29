import { Controller, useForm } from "react-hook-form";
import { RegisterFormFields } from "./AddRegisterModal";
import type { FC } from "react";
import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";
import type { Destination, Silobag } from "../../../../shared/types";
import TextArea from "../../../../shared/components/form/TextArea";
import Input from "../../../../shared/components/form/Input";

interface RegisterData {
    type: string;
    weight_kg: string;
    humidity: string;
    driver?: string;
    license_plate?: string;
    destinationId?: string;
    ctg?: string;
    cpe?: string;
    siloBagId?: string;
    location?: string;
    observations?: string;
}

interface RegisterType {
    type: string;
    weight_kg: number;
    humidity: number;
    truck?: { driver: string; license_plate: string };
    destination?: { id: string };
    ctg?: string;
    cpe?: string;
    silo_bag?: { id: string; location: string };
    details?: string;
}

const EditRegisterModal: FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (data: RegisterData) => void; 
    register: RegisterType; 
    siloBags: Silobag[]; 
    destinations: Destination[] 
}> = ({ isOpen, onClose, onSubmit, register, siloBags, destinations }) => {
    const { control, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            type: register.type || 'truck', weight_kg: register.weight_kg || '', humidity: register.humidity || '',
            driver: register.truck?.driver || '', license_plate: register.truck?.license_plate || '',
            destinationId: register.destination?.id || '', ctg: register.ctg || '', cpe: register.cpe || '',
            siloBagId: register.silo_bag?.id || '', location: register.silo_bag?.location || '',
            observations: register.details || ''
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Registro">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Tipo</label>
                    <p className="w-full p-3 bg-gray-100 rounded-xl">{register.type === 'truck' ? 'Camión' : 'Silobolsa'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Controller name="weight_kg" control={control} rules={{ required: 'Los kilos son obligatorios.' }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Kilos" type="number" placeholder="Ej: 30000" error={error?.message} />)} />
                    <Controller name="humidity" control={control} rules={{ required: 'La humedad es obligatoria.' }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Humedad (%)" type="number" placeholder="Ej: 14.5" error={error?.message} />)} />
                </div>
                <RegisterFormFields siloBags={siloBags} destinations={destinations} control={control} errors={errors} setValue={setValue} isEditMode={true} />
                <Controller name="observations" control={control} render={({ field }) => (<TextArea {...field} label="Observaciones" placeholder="Anotaciones adicionales..." />)} />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button className="w-[30%]" variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button className="w-[70%]" type="submit">Guardar Cambios</Button></div>
            </form>
        </Modal>
    );
};

export default EditRegisterModal;