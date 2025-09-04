import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
  loading
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-6">
        {message && <div className="text-sm text-text-secondary leading-relaxed">{message}</div>}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="w-1/2" type="button" onClick={onCancel}> {cancelLabel} </Button>
          <Button
            variant={destructive ? 'secondary' : 'primary'}
            className={`w-1/2 ${destructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
            type="button"
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
