import { openDB, type DBSchema } from 'idb';

// Estas constantes deben ser las mismas que en tu sw.ts
const DB_NAME = 'hallmay-offline-writes-db';
const STORE_NAME = 'offline-writes-queue';
const SYNC_TAG = 'sync-offline-writes';

// Definimos la estructura de una operación guardada
interface OfflineOperation {
    functionName: keyof typeof import('./serviceMap').serviceMap; // Tipado fuerte con el mapa de servicios
    args: any[];
    timestamp: number;
}

// Definimos el schema de nuestra base de datos IndexedDB
interface OfflineDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: OfflineOperation;
    };
}

// Inicializamos la conexión a la base de datos
const dbPromise = openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { autoIncrement: true, keyPath: 'id' });
        }
    },
});

/**
 * Guarda una operación fallida en la cola de IndexedDB y registra un evento de sincronización.
 * @param functionName El nombre de la función de servicio que falló.
 * @param args Los argumentos con los que se llamó a la función.
 */
export async function queueOfflineWrite(
    functionName: OfflineOperation['functionName'],
    args: any[]
) {
    try {
        const db = await dbPromise;
        await db.add(STORE_NAME, {
            functionName,
            args,
            timestamp: Date.now(),
        });

        // Pide al Service Worker que se sincronice cuando haya conexión
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(SYNC_TAG);

        console.log(`📦 Operación '${functionName}' guardada para sincronización en segundo plano.`);
    } catch (error) {
        console.error("🔥 No se pudo guardar la operación en la cola offline:", error);
    }
}