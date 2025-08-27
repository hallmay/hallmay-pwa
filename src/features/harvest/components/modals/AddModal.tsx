// src/components/harvest-session/modals/AddModal.tsx
import { Trash2, PlusCircle } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import Button from '../../../../shared/components/commons/Button';
import Modal from '../../../../shared/components/commons/Modal';
import { useCampaignFields } from '../../../../shared/hooks/field/useCampaignFields';
import { usePlots } from '../../../../shared/hooks/plot/usePlots';
import { useCrops } from '../../../../shared/hooks/crop/useCrops';
import { useHarvesters } from '../../../../shared/hooks/harvester/useHarvesters';
import { useHarvestManagers } from '../../../../shared/hooks/harvest-manager/useHarvestManagers';
import { startHarvestSession } from '../../services/harvestSession';
import useAuth from '../../../../shared/context/auth/AuthContext';
import { useEffect } from 'react';
import { useActiveCampaign } from '../../../../shared/hooks/campaign/useActiveCampaign';
import toast from 'react-hot-toast';
import Select from '../../../../shared/components/form/Select';
import Checkbox from '../../../../shared/components/form/Checkbox';
import Input from '../../../../shared/components/form/Input';

interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Definimos un tipo para los datos del formulario para mayor claridad
type HarvestFormData = {
    fieldId: string;
    plotId: string;
    cropId: string;
    hectares: number;
    estimatedYield: number;
    managerId: string;
    harvesters: { harvesterId: string; maps: boolean }[];
};

const AddModal = ({ isOpen, onClose }: AddModalProps) => {
    const { campaign } = useActiveCampaign();
    const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<HarvestFormData>({
        defaultValues: {
            fieldId: '',
            plotId: '',
            cropId: '',
            hectares: undefined,
            estimatedYield: undefined,
            managerId: '',
            harvesters: []
        }
    });
    const selectedFieldId = useWatch({ control, name: 'fieldId' });
    const selectedPlotId = useWatch({ control, name: 'plotId' })

    const { fields, append, remove } = useFieldArray({ control, name: "harvesters" });

    const { currentUser } = useAuth();
    const { campaignFields } = useCampaignFields(campaign?.id);
    const { plots } = usePlots(selectedFieldId);
    const { crops } = useCrops();
    const { harvesters } = useHarvesters();
    const { harvestManagers } = useHarvestManagers();

    // Buscamos el objeto completo del lote seleccionado
    const selectedPlot = plots?.find(p => p.id === selectedPlotId);

    useEffect(() => {
        if (selectedFieldId) {
            setValue('plotId', '', { shouldValidate: false });
            setValue('hectares', undefined, { shouldValidate: false });
        }
    }, [selectedFieldId, setValue]);


    useEffect(() => {
        if (selectedPlot) {
            setValue('hectares', selectedPlot.hectares || 0, { shouldValidate: true });
        } else {
            setValue('hectares', undefined, { shouldValidate: false });
        }
    }, [selectedPlot, setValue]);

    // Opciones para los selects
    const fieldOptions = campaignFields?.map(cf => ({ id: cf.field.id, name: cf.field.name })) || [];
    const plotOptions = plots?.map(plot => ({ id: plot.id, name: plot.name })) || [];
    const cropOptions = crops?.map(crop => ({ id: crop.id, name: crop.name })) || [];
    const harvesterOptions = harvesters?.map(harvester => ({ id: harvester.id, name: harvester.name })) || [];
    const managerOptions = harvestManagers?.map(manager => ({ id: manager.id, name: manager.name })) || [];

    const onSubmit = async (data: HarvestFormData) => {
        startHarvestSession({
            formData: data,
            currentUser,
            activeCampaign: campaign,
            allPlots: plots,
            allCampaignFields: campaignFields,
            allCrops: crops,
            allHarvestManagers: harvestManagers,
            allHarvesters: harvesters
        });

        toast.success('Lote iniciado con éxito.');
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Variable para saber si los lotes están cargando
    const plotsAreLoading = selectedFieldId && plots === undefined;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Iniciar Cosecha de Lote">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">

                    <Controller
                        name="fieldId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un campo.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Campo"
                                items={fieldOptions}
                                placeholder="Elige un campo..."
                                error={errors.fieldId?.message}
                            />
                        )}
                    />
                    <Controller
                        name="plotId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un lote.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Lote"
                                items={plotOptions}
                                placeholder={
                                    plotsAreLoading
                                        ? "Cargando lotes..."
                                        : !selectedFieldId
                                            ? "Elige un campo primero"
                                            : plotOptions.length === 0
                                                ? "No hay lotes para este campo"
                                                : "Elige un lote..."
                                }
                                disabled={!selectedFieldId || plotsAreLoading || plotOptions.length === 0}
                                error={errors.plotId?.message}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="cropId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un cultivo.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Cultivo"
                                items={cropOptions}
                                placeholder="Elige un cultivo..."
                                error={errors.cropId?.message}
                            />
                        )}
                    />
                    <Controller
                        name="managerId"
                        control={control}
                        rules={{ required: 'El responsable es obligatorio.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Responsable de Cosecha"
                                items={managerOptions}
                                placeholder="Seleccionar..."
                                error={errors.managerId?.message}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Hectáreas (ha)"
                        type="number"
                        placeholder="Ej: 120"
                        {...register('hectares', {
                            required: 'Las hectáreas son obligatorias.',
                            valueAsNumber: true,
                            min: { value: 0.1, message: 'Debe ser mayor a 0' }
                        })}
                        error={errors.hectares?.message}
                    />
                    <Input
                        label="Rinde Estimado (kg/ha)"
                        type="number"
                        placeholder="Ej: 3500"
                        {...register('estimatedYield', {
                            required: 'El rinde es obligatorio.',
                            valueAsNumber: true,
                            min: { value: 100, message: 'Debe ser mayor a 100' }
                        })}
                        error={errors.estimatedYield?.message}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                        Cosecheros Asignados
                    </label>
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-background rounded-lg">
                            <div className="flex-grow space-y-3">
                                <Controller
                                    name={`harvesters.${index}.harvesterId`}
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            items={harvesterOptions}
                                            placeholder="Seleccionar cosechero..."
                                            error={errors.harvesters?.[index]?.harvesterId?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name={`harvesters.${index}.maps`}
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

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => remove(index)}
                                aria-label="Quitar cosechero"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </Button>

                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            icon={PlusCircle}
                            onClick={() => append({ harvesterId: '', maps: false })}
                        >
                            Agregar Cosechero
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        className="w-[30%]"
                        variant="outline"
                        type="button"
                        onClick={handleClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="w-[70%]"
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Iniciar Cosecha'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddModal;