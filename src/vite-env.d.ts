/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// --- INICIO: Definiciones para Background Sync API ---

// 1. Definimos la interfaz para el objeto que gestiona la sincronización.
interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
}

// 2. Extendemos la interfaz nativa de TypeScript para ServiceWorkerRegistration.
// Esto se llama "declaration merging" y es la forma correcta de añadir propiedades.
interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
}

// 3. Definimos la interfaz para el evento 'sync' que recibe el Service Worker.
interface SyncEvent extends ExtendableEvent {
    readonly lastChance: boolean;
    readonly tag: string;
}