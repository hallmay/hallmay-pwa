import { Trash2 } from "lucide-react";
import { type FC, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useHarvesters } from "../../../../shared/hooks/harvester/useHarvesters";
import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";
import type { HarvestSession } from "../../../../shared/types";
import Input from "../../../../shared/components/form/Input";
import Checkbox from "../../../../shared/components/form/Checkbox";
import Select from "../../../../shared/components/form/Select";

const ManageHarvestersModal: FC<{ isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, harvestSession: HarvestSession }> = ({ isOpen, onClose, onSubmit, harvestSession }) => {
    const { control, handleSubmit, setValue, getValues, watch, trigger } = useForm({
        defaultValues: {
            harvesters: harvestSession.harvesters.map(h => ({ ...h, harvested_hectares: h.harvested_hectares || 0, plot_map: h.plot_map })),
            newHarvesterId: '',
            plotMap: false
        },
        mode: 'onChange'
    });
    const { fields, append, remove } = useFieldArray({ control, name: "harvesters" });
    const { harvesters: allHarvesters } = useHarvesters();

    const watchedHarvesters = watch("harvesters");
    const newHarvesterId = watch("newHarvesterId");
    const plotMap = watch("plotMap");

    const assignedHarvesterIds = watchedHarvesters.map(field => field.id);
    const availableHarvesters = allHarvesters.filter(h => !assignedHarvesterIds.includes(h.id));

    const totalHarvestedHectares = harvestSession.harvested_hectares || 0;
    const totalAssignedHectares = useMemo(() => {
        return watchedHarvesters.reduce((acc, curr) => acc + (parseFloat(String(curr.harvested_hectares)) || 0), 0);
    }, [watchedHarvesters]);
    const exceedsTotal = totalAssignedHectares > totalHarvestedHectares;

    useEffect(() => {
        if (fields.length === 1) {
            setValue(`harvesters.0.harvested_hectares`, totalHarvestedHectares, { shouldValidate: true });
        }
    }, [fields.length, totalHarvestedHectares, setValue]);

    const handleAddHarvester = () => {
        const harvesterToAdd = allHarvesters.find(h => h.id === newHarvesterId);
        if (harvesterToAdd) {
            append({ ...harvesterToAdd, harvested_hectares: 0, plot_map: plotMap });
            setValue('newHarvesterId', '');
            setValue('plotMap', false);
        }
    };

    console.log(watchedHarvesters)

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Cosecheros">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4 max-h-100 md:max-h-none overflow-y-auto md:overflow-y-visible p-1">
                    {fields.length > 0 ? fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                <p className="font-semibold text-gray-800">{field.name}</p>
                                <Controller
                                    name={`harvesters.${index}.harvested_hectares`}
                                    control={control}
                                    rules={{
                                        required: "Campo requerido", min: { value: 0, message: "Debe ser positivo" },
                                        validate: () => {
                                            const total = getValues("harvesters").reduce((acc, curr) => acc + (parseFloat(String(curr.harvested_hectares)) || 0), 0);
                                            return total <= totalHarvestedHectares || `El total excede las ${totalHarvestedHectares} ha.`;
                                        }
                                    }}
                                    render={({ field: controllerField, fieldState: { error } }) => (
                                        <Input
                                            {...controllerField}
                                            onChange={(e) => {
                                                controllerField.onChange(e);
                                                trigger("harvesters");
                                            }}
                                            label="Hectáreas Cosechadas"
                                            type="number"
                                            disabled={fields.length === 1}
                                            error={error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name={`harvesters.${index}.plot_map`}
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            {...field}
                                            checked={field.value}
                                            label="Mapea el lote"
                                        />
                                    )}
                                />
                            </div>
                            {fields.length > 1 && (
                                <Button variant="ghost" type="button" onClick={() => remove(index)} aria-label="Eliminar cosechero"><Trash2 className="h-5 w-5 text-red-500" /></Button>
                            )}
                        </div>
                    )) : (<p className="text-center text-gray-500 py-4">No hay cosecheros asignados.</p>)}
                </div>

                <div className={`p-3 rounded-lg text-center font-semibold ${exceedsTotal ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                    Total Asignado: {totalAssignedHectares.toFixed(2)} ha / {totalHarvestedHectares.toFixed(2)} ha
                    {exceedsTotal && <p className="text-xs font-normal mt-1">El total asignado no puede superar el total cosechado.</p>}
                </div>

                <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Añadir Cosechero</label>
                    <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                            <Controller
                                name="newHarvesterId"

                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        items={availableHarvesters.map(h => ({ id: h.id, name: h.name }))}
                                        placeholder="Seleccionar..."
                                        className="flex-1"
                                    />
                                )}
                            />
                            <Controller
                                name='plotMap'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={field.value}
                                        label="Mapea el lote"
                                    />
                                )}
                            />
                        </div>
                        <Button type="button" onClick={handleAddHarvester} disabled={!newHarvesterId} className="w-[30%]">Agregar</Button>
                    </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" type="button" onClick={onClose} className="w-[30%]">Cancelar</Button>
                    <Button type="submit" disabled={exceedsTotal} className="w-[70%]">Guardar Cambios</Button>
                </div>
            </form>
        </Modal>
    );
};


export default ManageHarvestersModal;