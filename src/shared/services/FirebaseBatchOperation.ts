import { WriteBatch, writeBatch, doc, collection, increment, Timestamp, DocumentReference } from 'firebase/firestore';
import { BaseFirebaseService } from './BaseFirebaseService';

/**
 * Clase base para operaciones batch de Firebase que maneja transacciones complejas
 * con múltiples documentos y subcolecciones.
 */
export abstract class FirebaseBatchOperation extends BaseFirebaseService {
  protected batch: WriteBatch;
  
  constructor() {
    super();
    this.batch = writeBatch(this.db);
  }

  /**
   * Reinicia el batch para una nueva operación
   */
  protected resetBatch(): void {
    this.batch = writeBatch(this.db);
  }

  /**
   * Agrega una operación de creación al batch
   */
  protected batchCreate<T extends Record<string, any>>(
    collectionName: string, 
    data: T,
    customDocId?: string,
    includeCreatedAt: boolean = true
  ): DocumentReference {
    const docRef = customDocId 
      ? doc(this.db, collectionName, customDocId)
      : doc(collection(this.db, collectionName));
    
    const payload = includeCreatedAt 
      ? this.withTimestamps(data, true, true)
      : data;
    
    this.batch.set(docRef, payload);
    return docRef;
  }

  /**
   * Agrega una operación de actualización al batch
   */
  protected batchUpdate(
    collectionName: string,
    documentId: string,
    data: Record<string, any>,
    includeUpdatedAt: boolean = true
  ): DocumentReference {
    const docRef = doc(this.db, collectionName, documentId);
    const payload = includeUpdatedAt 
      ? this.withTimestamps(data, false, true)
      : data;
    
    this.batch.update(docRef, payload);
    return docRef;
  }

  /**
   * Agrega una operación de incremento al batch
   */
  protected batchIncrement(
    collectionName: string,
    documentId: string,
    field: string,
    incrementValue: number,
    additionalData?: Record<string, any>
  ): DocumentReference {
    const docRef = doc(this.db, collectionName, documentId);
    const updateData = {
      [field]: increment(incrementValue),
      ...additionalData,
      updated_at: Timestamp.now()
    };
    
    this.batch.update(docRef, updateData);
    return docRef;
  }

  /**
   * Agrega una operación de eliminación al batch
   */
  protected batchDelete(collectionName: string, documentId: string): DocumentReference {
    const docRef = doc(this.db, collectionName, documentId);
    this.batch.delete(docRef);
    return docRef;
  }

  /**
   * Ejecuta todas las operaciones del batch
   */
  protected async commitBatch(): Promise<void> {
    try {
      await this.batch.commit();
    } catch (error) {
      console.error('Error al ejecutar operación batch:', error);
      throw error;
    }
  }

  /**
   * Crea una referencia a un documento en una subcolección
   */
  protected getSubcollectionRef(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    docId?: string
  ): DocumentReference {
    const path = `${parentCollection}/${parentDocId}/${subcollection}`;
    return docId 
      ? doc(this.db, path, docId)
      : doc(collection(this.db, path));
  }
}
