import { Share, Plus } from 'lucide-react';

const IOSInstallInstructions = () => {
  return (
    <div className="text-left">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
            1
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">Toca el botón Compartir</p>
            <div className="flex items-center gap-2 mt-1">
              <Share size={16} className="text-primary" />
              <span className="text-gray-600 text-xs">en la parte inferior de Safari</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
            2
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">Selecciona "Agregar a pantalla de inicio"</p>
            <div className="flex items-center gap-2 mt-1">
              <Plus size={16} className="text-primary" />
              <span className="text-gray-600 text-xs">desplázate hacia abajo si no lo ves</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
            3
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">Toca "Agregar"</p>
            <p className="text-gray-600 text-xs mt-1">¡Listo! Aparecerá en tu pantalla de inicio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallInstructions;
