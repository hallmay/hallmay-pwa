import { doc, updateDoc, addDoc, collection, Timestamp, DocumentReference } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Clase base para servicios de Firebase que proporciona operaciones comunes
 * como crear, actualizar documentos y manejo de timestamps automático.
 */
export abstract class BaseFirebaseService {
  protected readonly db = db;

  /**
   * Crea un documento con timestamps automáticos
   */
  protected async createDocument<T extends Record<string, any>>(
    collectionName: string,
    data: T,
    includeCreatedAt: boolean = true
  ): Promise<DocumentReference> {
    const payload = includeCreatedAt 
      ? { ...data, created_at: Timestamp.now(), updated_at: Timestamp.now() }
      : data;

    try {
      return await addDoc(collection(this.db, collectionName), payload);
    } catch (error) {
      console.error(`Error al crear documento en ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un documento con timestamp automático
   */
  protected async updateDocument(
    collectionName: string,
    documentId: string,
    data: Record<string, any>,
    includeUpdatedAt: boolean = true
  ): Promise<void> {
    const payload = includeUpdatedAt 
      ? { ...data, updated_at: Timestamp.now() }
      : data;

    try {
      const docRef = doc(this.db, collectionName, documentId);
      await updateDoc(docRef, payload);
    } catch (error) {
      console.error(`Error al actualizar documento ${documentId} en ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene una referencia a un documento
   */
  protected getDocumentReference(collectionName: string, documentId?: string): DocumentReference {
    return documentId 
      ? doc(this.db, collectionName, documentId)
      : doc(collection(this.db, collectionName));
  }

  /**
   * Valida que los datos requeridos estén presentes
   */
  protected validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Convierte strings numéricos a números, manejando valores falsy
   */
  protected parseNumericValue(value: string | number | undefined | null, defaultValue: number = 0): number {
    if (typeof value === 'number') return value;
    if (!value) return defaultValue;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Crea un objeto con timestamps estándar
   */
  protected withTimestamps<T extends Record<string, any>>(
    data: T, 
    includeCreated: boolean = false, 
    includeUpdated: boolean = false
  ): T & { created_at?: any; updated_at?: any } {
    const result: any = { ...data };
    
    if (includeCreated) result.created_at = Timestamp.now();
    if (includeUpdated) result.updated_at = Timestamp.now();
    
    return result;
  }
}
