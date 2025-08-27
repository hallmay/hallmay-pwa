import type { FC } from "react";
import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";
import { AlertTriangle } from "lucide-react";

const DeleteRegisterModal: FC<{ isOpen: boolean, onClose: () => void, onConfirm: () => void, }> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Registro">
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            ¿Estás seguro de que deseas eliminar este registro?
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-1">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" type="button" onClick={onClose}>
                    Cancelar
                </Button>
                <Button variant="danger" className="w-full" onClick={onConfirm}>
                    Sí, eliminar
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteRegisterModal;