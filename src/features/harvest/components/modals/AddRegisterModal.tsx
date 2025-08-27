import { ChevronDown } from "lucide-react";
import { type FC, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Modal from "../../../../shared/components/commons/Modal";
import Input from "../../../../shared/components/form/Input";
import TextArea from "../../../../shared/components/form/TextArea";
import type { Silobag, Destination } from "../../../../shared/types";
import Select from "../../../../shared/components/form/Select";
import Button from "../../../../shared/components/commons/Button";

export const RegisterFormFields: FC<{ control: any, errors: any, setValue: any, isEditMode: boolean, siloBags: Silobag[], destinations: Destination[] }> = ({ control, setValue, isEditMode, siloBags, destinations }) => {
    const type = useWatch({ control, name: 'type' });
    const [siloBagMode, setSiloBagMode] = useState<'select' | 'create'>('select');
    const [showMore, setShowMore] = useState(false);
    const siloBagOptions = siloBags.map(sb => ({ id: sb.id, name: sb.name }));
    const destinationOptions = destinations.map(d => ({ id: d.id, name: d.name }));

    const handleSiloBagModeChange = (mode: 'select' | 'create') => {
        setSiloBagMode(mode);
        if (mode === 'create') {
            setValue('siloBagId', '', { shouldValidate: true });
        } else {
            setValue('newSiloBagName', '', { shouldValidate: true });
        }
    };

    return (
        <>
            {type === 'truck' && (
                <div className="space-y-4 animate-fade-in-fast">
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="driver" control={control} render={({ field }) => (<Input {...field} label="Chofer" placeholder="Nombre del chofer" />)} />
                        <Controller name="license_plate" control={control} rules={{ required: 'La patente es obligatoria.' }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Patente" placeholder="AAA-123-AA" error={error?.message} />)} />
                    </div>
                    <Controller name="destinationId" control={control} render={({ field, fieldState: { error } }) => (<Select {...field} label="Destino" items={destinationOptions} placeholder="Seleccionar destino..." error={error?.message} />)} />
                    <button type="button" onClick={() => setShowMore(!showMore)} className="text-sm text-primary font-semibold flex items-center gap-1">{showMore ? 'Mostrar menos' : 'Mostrar más'} <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} /></button>
                    {showMore && (<div className="grid grid-cols-2 gap-4 animate-fade-in-fast"><Controller name="ctg" control={control} render={({ field }) => (<Input {...field} label="CTG" placeholder="Número de CTG" />)} /><Controller name="cpe" control={control} render={({ field }) => (<Input {...field} label="CPE" placeholder="Número de CPE" />)} /></div>)}
                </div>
            )}
            {type === 'silo_bag' && (
                <div className="space-y-4 animate-fade-in-fast">
                    {isEditMode ? (
                        <Controller name="siloBagId" control={control} rules={{ required: 'Debe seleccionar un silobolsa.' }} render={({ field, fieldState: { error } }) => (<Select {...field} label="Silobolsa" items={siloBagOptions} placeholder="Seleccionar existente..." error={error?.message} />)} />
                    ) : (
                        <div>
                            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200 rounded-lg mb-4">
                                <button type="button" onClick={() => handleSiloBagModeChange('select')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${siloBagMode === 'select' ? 'bg-white shadow text-primary-darker' : 'text-gray-600'}`}>Seleccionar Existente</button>
                                <button type="button" onClick={() => handleSiloBagModeChange('create')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${siloBagMode === 'create' ? 'bg-white shadow text-primary-darker' : 'text-gray-600'}`}>Crear Nuevo</button>
                            </div>
                            {siloBagMode === 'select' && (
                                <Controller name="siloBagId" control={control} rules={{ required: siloBagMode === 'select' ? 'Debe seleccionar un silobolsa.' : false }} render={({ field, fieldState: { error } }) => (<Select {...field} items={siloBagOptions} placeholder="Seleccionar existente..." error={error?.message} />)} />
                            )}
                            {siloBagMode === 'create' && (
                                <>
                                    <Controller name="newSiloBagName" control={control} rules={{ required: siloBagMode === 'create' ? 'El nombre es obligatorio.' : false }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Nombre del Nuevo Silobolsa" placeholder="Ej: SB-004" error={error?.message} />)} />
                                    <Controller name="location" control={control} render={({ field }) => (<Input {...field} label="Ubicación" placeholder="Lugar donde se encuentra" />)} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

const AddRegisterModal: FC<{ isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, siloBags: Silobag[], destinations: Destination[] }> = ({ isOpen, onClose, onSubmit, siloBags, destinations }) => {
    const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm({
        defaultValues: {
            type: 'truck', weight_kg: '', humidity: '', driver: '', license_plate: '',
            destinationId: '', ctg: '', cpe: '', siloBagId: '', newSiloBagName: '',
            location: '', observations: ''
        }
    });

    const handleClose = () => {
        onClose();
        reset();
    }

    const handleOnSubmit = (data: any) => {
        onSubmit(data);
        reset();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Registro de Cosecha">
            <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
                <Controller name="type" control={control} render={({ field }) => (<Select {...field} label="Tipo" items={[{ id: 'truck', name: 'Camión' }, { id: 'silo_bag', name: 'Silobolsa' }]} />)} />
                <div className="grid grid-cols-2 gap-4">
                    <Controller name="weight_kg" control={control} rules={{ required: 'Los kilos son obligatorios.' }} render={({ field }) => (<Input {...field} label="Kilos" type="number" placeholder="Ej: 30000" error={errors.weight_kg?.message} />)} />
                    <Controller name="humidity" control={control} rules={{ required: 'La humedad es obligatoria.' }} render={({ field }) => (<Input {...field} label="Humedad (%)" type="number" placeholder="Ej: 14.5" error={errors.humidity?.message} />)} />
                </div>
                <RegisterFormFields siloBags={siloBags} destinations={destinations} control={control} errors={errors} setValue={setValue} isEditMode={false} />
                <Controller name="observations" control={control} render={({ field }) => (<TextArea {...field} label="Observaciones" placeholder="Anotaciones adicionales..." />)} />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button className="w-[30%]" variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button className="w-[70%]" type="submit" >Guardar Registro</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddRegisterModal;