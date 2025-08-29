import { where, type QueryConstraint } from "firebase/firestore";
import type { User } from "../types";

/**
 * Contiene las restricciones de seguridad base para las consultas de Firestore.
 */
export class QueryBuilder {
    private readonly user: User | null;
    private constraints: QueryConstraint[] = [];

    constructor(user: User | null) {
        this.user = user;
        this.addOrgConstraint();
    }

    /**
     * Añade el filtro obligatorio de organization_id.
     */
    private addOrgConstraint(): this {
        if (!this.user) return this;
        this.constraints.push(where('organization_id', '==', this.user.organizationId));
        return this;
    }

    /**
     * Añade un filtro por el campo 'field.id' si el usuario no es admin
     * y tiene campos específicos asignados.
     * @param {string} fieldProperty - El nombre de la propiedad a filtrar (ej: 'field.id').
     */
    public withFieldAccess(fieldProperty: string = 'field.id'): this {
        if (!this.user || this.user.role === 'admin' || this.user.role === 'super-admin') {
            return this; // Los admins ven todo, no se aplica filtro.
        }

        const accessibleIds = this.user.accessibleFieldIds;

        if (accessibleIds && accessibleIds.length > 0) {
            this.constraints.push(where(fieldProperty, 'in', accessibleIds));
        }

        return this;
    }

    /**
     * Devuelve el array de restricciones listas para ser usadas en una query.
     */
    public build(): QueryConstraint[] {
        return this.constraints;
    }
}

/**
 * Función de ayuda para crear una instancia del QueryBuilder.
 * @param user - El objeto del usuario actual del AuthContext.
 */
export const createSecurityQuery = (user: User | null) => {
    return new QueryBuilder(user);
};