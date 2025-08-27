import Button from "../../../../shared/components/commons/Button";
import Modal from "../../../../shared/components/commons/Modal";

const UpdateStatusModal = ({ isOpen, onClose, selectedTruck, statusOptions, handleStatusChange }) => {
    if (!selectedTruck) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Actualizar Estado`}>
            <div className="space-y-3">
                {statusOptions.map((status) => (
                    <button
                        key={status.value}
                        onClick={() => handleStatusChange(selectedTruck.id, status.value)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-colors disabled:opacity-50 ${selectedTruck.status === status.value ? 'border-primary-darker bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <div className="font-medium text-gray-900">{status.label}</div>
                        {selectedTruck.status === status.value && <div className="text-sm text-primary-darker mt-1">Estado actual</div>}
                    </button>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClose} className="w-full">Cancelar</Button>
            </div>
        </Modal>
    );
};

export default UpdateStatusModal;