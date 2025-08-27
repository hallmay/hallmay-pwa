import { useState, useCallback } from 'react';
import type { HarvestSession, HarvestSessionRegister } from '../../../shared/types';
import { useSiloBags } from '../../silobags/hooks/useSilobags';
import { useDestinations } from '../../../shared/hooks/destination/useDestinations';
import toast from 'react-hot-toast';
import { addRegister, deleteRegister, updateRegister } from '../services/harvestSessionRegister';

export const useRegisterManager = (
    harvestSession: HarvestSession
) => {
    const [selectedRegister, setSelectedRegister] = useState<HarvestSessionRegister | null>(null);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);

    const { siloBags } = useSiloBags({ fieldId: 'all', cropId: harvestSession.crop.id, status: 'active' });
    const { destinations } = useDestinations();

    const handleAdd = useCallback(async (data: any) => {
        const formDataWithOrg = { ...data, organization_id: harvestSession.organization_id };

        addRegister({
            formData: formDataWithOrg,
            harvestSession,
            siloBags,
            destinations
        }).catch(error => {
            console.error('Error al agregar registro:', error);
        });
        setModal(null);
        toast.success("Registro creado con éxito");
    }, [destinations, harvestSession, siloBags]);

    const handleUpdate = useCallback(async (newData: any) => {
        if (!selectedRegister) return;
        const formDataWithOrg = { ...newData, organization_id: harvestSession.organization_id };

        updateRegister({
            formData: formDataWithOrg,
            originalRegister: selectedRegister,
            harvestSession,
            siloBags,
            destinations
        }).catch(error => {
            console.log("Error al actualizar el registro", error);
        });
        setModal(null);
        toast.success("Registro actualizado con éxito.");
    }, [selectedRegister, harvestSession, siloBags, destinations]);

    const handleDelete = useCallback(async () => {
        if (!selectedRegister) return;

        deleteRegister({
            registerToDelete: selectedRegister,
            harvestSession
        }).catch(error => {
            console.error('Error al eliminar registro:', error);
        });
        setModal(null);
        toast.success("Registro eliminado con éxito");
    }, [selectedRegister, harvestSession]);

    const openModal = useCallback((type: 'add' | 'edit' | 'delete', register?: HarvestSessionRegister) => {
        if (register) setSelectedRegister(register);
        setModal(type);
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
        setSelectedRegister(null);
    }, []);

    return {
        selectedRegister,
        modal,
        siloBags,
        destinations,
        handlers: {
            add: handleAdd,
            update: handleUpdate,
            delete: handleDelete,
        },
        ui: {
            openModal,
            closeModal,
        },
    };
};