/// <reference lib="webworker" />

import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { openDB, type DBSchema } from 'idb';
import { serviceMap, type ServiceFunctionMap } from './shared/services/serviceMap';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
    // Comprueba si el mensaje es para activar el nuevo service worker.
    if (event.data && event.data.type === 'SKIP_WAITING') {
        // self.skipWaiting() le dice al nuevo service worker que se active inmediatamente,
        // reemplazando al antiguo.
        self.skipWaiting();
    }
});

// Inyecta el manifest de precache generado por VitePWA.
precacheAndRoute(self.__WB_MANIFEST);

// Limpia cachés antiguas
cleanupOutdatedCaches();

// Permite que la app funcione como una Single Page Application (SPA) offline.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// --- LÓGICA DE BACKGROUND SYNC ---

const DB_NAME = 'hallmay-offline-writes-db';
const STORE_NAME = 'offline-writes-queue';
const SYNC_TAG = 'sync-offline-writes';

interface OfflineOperation {
    id?: number;
    functionName: keyof ServiceFunctionMap;
    args: any[];
    timestamp: number;
}

interface OfflineDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: OfflineOperation;
    };
}

const dbPromise = openDB<OfflineDB>(DB_NAME, 1);

// Listener del evento 'sync'. Se activa cuando vuelve la conexión.
self.addEventListener('sync', (event) => {
    const syncEvent = event as SyncEvent;
    if (syncEvent.tag === SYNC_TAG) {
        console.log('🔄 Evento de Sync recibido. Procesando cola de escrituras...');
        syncEvent.waitUntil(processOfflineQueue());
    }
});

async function processOfflineQueue() {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const operations = await tx.objectStore(STORE_NAME).getAll();

    if (operations.length === 0) {
        console.log('✅ Cola de escrituras vacía.');
        return;
    }

    console.log(`📡 Re-enviando ${operations.length} operaciones guardadas...`);

    for (const op of operations) {
        try {
            const serviceFunction = serviceMap[op.functionName];
            if (serviceFunction) {
                await serviceFunction.apply(null, op.args);

                await db.delete(STORE_NAME, op.id!);
                console.log(`✅ Operación '${op.functionName}' (ID: ${op.id}) procesada con éxito.`);
            } else {
                throw new Error(`Función de servicio no encontrada: ${op.functionName}`);
            }
        } catch (error) {
            console.error(`🔥 Falló la operación '${op.functionName}' (ID: ${op.id}). Permanecerá en la cola.`, error);
            return;
        }
    }

    console.log('🎉 Todas las operaciones en la cola fueron procesadas.');

    // Notificamos a la app que la sincronización fue exitosa
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_SUCCESS' });
    });
}