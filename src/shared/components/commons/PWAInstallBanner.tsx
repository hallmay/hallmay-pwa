import { X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import Button from './Button';
import Modal from './Modal';
import IOSInstallInstructions from './IOSInstallInstructions';

const PWAInstallBanner = () => {
  const { showInstallBanner, dismissBanner, canInstall, isIOS } = usePWAInstall();

  if (!showInstallBanner || !canInstall) {
    return null;
  }

  return (
    <Modal isOpen={showInstallBanner} onClose={dismissBanner}>
      <div className="text-center">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary bg-opacity-10 p-3 rounded-full mx-auto">
            <Smartphone size={24} className="text-primary" />
          </div>
          <button
            onClick={dismissBanner}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {isIOS ? '📱 Instalar en iPhone/iPad' : '💻 Instalar Aplicación'}
        </h3>
        
        <p className="text-gray-600 mb-6 text-sm">
          {isIOS 
            ? 'Sigue estos pasos para instalar Hallmay en tu dispositivo:'
            : 'Instala nuestra aplicación para una mejor experiencia'
          }
        </p>

        {/* Instrucciones */}
        {isIOS ? (
          <IOSInstallInstructions />
        ) : (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Haz clic en "Instalar" cuando aparezca la notificación del navegador, 
              o busca el botón de instalación en la barra de direcciones.
            </p>
          </div>
        )}

        {/* Botón de acción */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={dismissBanner}
            variant="primary"
            className="px-8"
          >
            {isIOS ? 'Entendido' : 'Vale, entendido'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PWAInstallBanner;
