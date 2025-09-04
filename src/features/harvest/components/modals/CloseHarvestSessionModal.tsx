import { useState } from 'react';
import Modal from '../../../../shared/components/commons/Modal';
import Button from '../../../../shared/components/commons/Button';
import type { HarvestSession } from '../../../../shared/types';

interface CloseHarvestSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: HarvestSession;
  onConfirm: () => Promise<void>;
}

const CloseHarvestSessionModal: React.FC<CloseHarvestSessionModalProps> = ({ isOpen, onClose, session, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose()} title={`Cerrar Cosecha - Lote ${session.plot.name}`}>      
      <div className="space-y-5">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <p>Estás por cerrar la sesión de cosecha del lote <strong>{session.plot.name}</strong>.</p>
          <p className="mt-1">Avance final: <strong>{session.harvested_hectares} / {session.hectares} ha</strong>.</p>
          <p className="mt-2 font-medium">⚠️ Esta acción es irreversible y la sesión quedará en estado "Finalizada".</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="danger" type="button" onClick={handleConfirm} isLoading={loading}>Confirmar Cierre</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CloseHarvestSessionModal;
