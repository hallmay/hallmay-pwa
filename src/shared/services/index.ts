/**
 * Exporta las clases base refactorizadas para servicios de Firebase
 * 
 * Este módulo proporciona una arquitectura limpia y reutilizable para
 * operaciones de Firebase, eliminando duplicación de código y 
 * estandarizando el manejo de errores y timestamps.
 */

export { BaseFirebaseService } from './BaseFirebaseService';
export { FirebaseBatchOperation } from './FirebaseBatchOperation';

/**
 * Guía de uso:
 * 
 * 1. BaseFirebaseService: Para operaciones simples de CRUD
 *    - createDocument(): Crear documentos con timestamps automáticos
 *    - updateDocument(): Actualizar documentos con timestamps automáticos
 *    - validateRequiredFields(): Validar campos requeridos
 *    - parseNumericValue(): Convertir valores numéricos de forma segura
 * 
 * 2. FirebaseBatchOperation: Para operaciones batch complejas
 *    - batchCreate(): Agregar operación de creación al batch
 *    - batchUpdate(): Agregar operación de actualización al batch  
 *    - batchIncrement(): Agregar operación de incremento al batch
 *    - batchDelete(): Agregar operación de eliminación al batch
 *    - commitBatch(): Ejecutar todas las operaciones del batch
 * 
 * Ejemplo de uso:
 * 
 * ```typescript
 * import { BaseFirebaseService } from '../../../shared/services';
 * 
 * class MyService extends BaseFirebaseService {
 *   async createItem(data: MyData) {
 *     this.validateRequiredFields(data, ['name', 'type']);
 *     await this.createDocument('my_collection', data);
 *   }
 * }
 * ```
 */
