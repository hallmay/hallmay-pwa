// src/components/pwa/UpdateManager.tsx
import { useRegisterSW } from 'virtual:pwa-register/react';
import { UploadCloud } from 'lucide-react';
import Button from './Button';
import Card from './Card';

function UpdateManager() {
    const intervalMS = 60 * 60 * 1000; // 1 hora en milisegundos

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        /**
         * Esta función se llama una sola vez, cuando el Service Worker se registra con éxito.
         * Aquí es el lugar ideal para configurar las comprobaciones periódicas.
         */
        onRegistered(r) {
            if (r) {
                // Comprobación periódica
                setInterval(() => {
                    console.log('Buscando actualizaciones del Service Worker...');
                    r.update();
                }, intervalMS);

                // Comprobación cuando la pestaña vuelve a estar visible
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        console.log('Pestaña visible, buscando actualizaciones...');
                        r.update();
                    }
                });
            }
        },
        onRegisterError(error) {
            console.error('Error en el registro del Service Worker:', error);
        }
    });

    if (needRefresh) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101] flex justify-center items-center p-4 animate-fade-in">
                <Card className="max-w-lg w-full text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                        <UploadCloud size={32} className="text-primary-dark" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl font-bold text-text-primary">Nueva versión disponible</h3>
                        <p className="mt-2 text-text-secondary">
                            Hemos lanzado mejoras importantes. Por favor, actualiza la aplicación para continuar.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button
                            variant="primary"
                            onClick={() => updateServiceWorker(true)}
                            className="w-full sm:w-auto sm:px-10"
                        >
                            Actualizar
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return null;
}

export default UpdateManager;