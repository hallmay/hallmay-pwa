import { useState, useCallback } from 'react';
import type { Silobag, CampaignField, Crop } from '../../../shared/types';
import { createSilobag, extractKgsSilobag, closeSilobag } from '../services/siloBags';
import useAuth from '../../../shared/context/auth/AuthContext';
import toast from 'react-hot-toast';

export const useSiloBagManager = (fields: Partial<CampaignField>[], crops: Partial<Crop>[]) => {
    const [modalState, setModalState] = useState<{ type: 'create' | 'extract' | 'close' | null; data?: Silobag }>({ type: null });
    const { currentUser } = useAuth();

    
    const handleCreate = useCallback(async (formData: any) => {
        if (!currentUser) return;
        createSilobag({ formData, currentUser, fields, crops }).catch(error => {
            console.error("Error al crear silobolsa:", error);
        })
        closeModal();
        toast.success("Se creo el silobolsa con éxito.")
    }, [currentUser, fields, crops]);

    const handleExtract = useCallback(async (formData: any) => {
        if (!modalState.data || !currentUser) return;

        extractKgsSilobag({
            siloBag: modalState.data,
            formData,
            currentUser
        }).catch(error => {
            console.error("Error al extraer kilos:", error);
        });
        closeModal();
        toast.success("Se extrajeron los kilos con éxito.");
    }, [modalState.data, currentUser]);

    const handleCloseSilo = useCallback(async (formData: any) => {
        if (!modalState.data || !currentUser) return;

        closeSilobag({ siloBag: modalState.data, formData }).catch(error => {
            console.error("Error al cerrar el silo:", error);
        });
        closeModal();
        toast.success("Se cerró el silobolsa con éxito.");

    }, [modalState.data]);

    const openModal = useCallback((type: 'create' | 'extract' | 'close', data?: Silobag) => {
        setModalState({ type, data });
    }, []);

    const closeModal = useCallback(() => {
        setModalState({ type: null, data: undefined });
    }, []);

    return {
        modalState,
        openModal,
        closeModal,
        handlers: {
            create: handleCreate,
            extract: handleExtract,
            close: handleCloseSilo,
        },
    };
};