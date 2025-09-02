// src/shared/services/priming.ts
import { collection, query, where, getDocs, orderBy, limit, Timestamp, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";
import type { CampaignField, User } from "../types";
import { createSecurityQuery } from "../firebase/queryBuilder";

/**
 * Servicio para precargar datos críticos en el caché de Firestore.
 * Utiliza un enfoque incremental para sincronizaciones posteriores al primer login.
 */
class PrimingService {
    private user: User | null = null;
    private lastSync: Timestamp | null = null;

    async prime(user: User): Promise<void> {
        this.user = user;
        try {
            const lastSyncItem = localStorage.getItem('lastSync');
            this.lastSync = lastSyncItem ?
                Timestamp.fromDate(new Date(lastSyncItem)) : null;

            console.log(`⏳ Iniciando priming. Última sincronización: ${this.lastSync ? this.lastSync.toDate() : 'n/a'}`);

            const baseSecurityConstraints = createSecurityQuery(this.user).build()

            // Cargar datos globales y de la campaña activa
            const activeCampaignSnap = await this.loadGlobalAndCampaignData(baseSecurityConstraints);
            
            const campaign = activeCampaignSnap.docs[0] ? { id: activeCampaignSnap.docs[0].id, ...activeCampaignSnap.docs[0].data() } : null;
            if (!campaign) {
                console.warn('No active campaign found');
                return;
            }

            // Cargar campos y determinar los relevantes para el usuario
            const campaignFieldsSnap = await this.loadCampaignFields(campaign.id);
            const allCampaignFieldIds = campaignFieldsSnap.docs
                .map((doc) => (doc.data() as CampaignField).field?.id)
                .filter((id): id is string => Boolean(id));
            
            const userAccessibleFields = this.user?.accessibleFieldIds || [];
            const isAdmin = this.user?.role === 'admin' || this.user?.role === 'superadmin';

            const relevantFieldIds = isAdmin || userAccessibleFields.length === 0
                ? allCampaignFieldIds
                : allCampaignFieldIds.filter(fieldId => userAccessibleFields.includes(fieldId));

            // Cargar datos específicos para las páginas principales (sesiones, lotes, silobolsas)
            const [_allPlotsSnap, allSessionsSnap, siloBagsSnap, _logisticsSnap] = await Promise.all([
                this.loadPlots(relevantFieldIds),
                this.loadSessionsByFields(campaign.id, relevantFieldIds),
                this.loadSiloBags(relevantFieldIds),
                this.loadLogistics(relevantFieldIds)
            ]);

            await this.loadCriticalSubcollections(allSessionsSnap.docs, siloBagsSnap.docs);
            
            localStorage.setItem('lastSync', new Date().toISOString());
            console.log('✅ Priming completado.');

        } catch (error) {
            console.error('Error during priming:', error);
            throw error;
        }
    }

    private async loadGlobalAndCampaignData(baseConstraints: any) {
        const incrementalConstraints = [...baseConstraints];
        if (this.lastSync) {
            // El filtro 'updated_at' ahora es suficiente para creaciones y ediciones.
            incrementalConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const promises = [
            getDocs(query(collection(db, 'campaigns'), ...baseConstraints, where('active', '==', true), limit(1))),
            getDocs(query(collection(db, 'crops'), ...incrementalConstraints)),
            getDocs(query(collection(db, 'harvesters'), ...incrementalConstraints)),
            getDocs(query(collection(db, 'destinations'), ...incrementalConstraints)),
            getDocs(query(collection(db, 'users'), ...incrementalConstraints, where('role', 'in', ['admin', 'manager'])))
        ];
        
        const [activeCampaignSnap] = await Promise.all(promises);
        return activeCampaignSnap;
    }

    private async loadCampaignFields(campaignId: string) {
        const securityConstraints = createSecurityQuery(this.user)
            .withFieldAccess('field.id')
            .build();
        
        const finalConstraints = [...securityConstraints, where('campaign.id', '==', campaignId)];
        if (this.lastSync) {
            finalConstraints.push(where('updated_at', '>', this.lastSync));
        }
        return await getDocs(query(collection(db, 'campaign_fields'), ...finalConstraints));
    }

    private async loadPlots(fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };
        
        const baseConstraints = createSecurityQuery(this.user).build();
        if (this.lastSync) {
            baseConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 10);
        const plotPromises = fieldChunks.map(chunk =>
            getDocs(query(collection(db, 'plots'), ...baseConstraints, where('field.id', 'in', chunk)))
        );
        const results = await Promise.all(plotPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadSessionsByFields(campaignId: string, fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };
        
        const baseConstraints = createSecurityQuery(this.user).build();
        if (this.lastSync) {
            baseConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 10);
        const sessionPromises = fieldChunks.map(chunk => {
            const finalConstraints = [
                ...baseConstraints,
                where('campaign.id', '==', campaignId),
                where('status', 'in', ['pending', 'in-progress']),
                where('field.id', 'in', chunk)
            ];
            return getDocs(query(collection(db, 'harvest_sessions'), ...finalConstraints));
        });
        const results = await Promise.all(sessionPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadSiloBags(fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };

        const securityConstraints = createSecurityQuery(this.user).build();
        const baseConstraints = [...securityConstraints, where('status','==', 'active')];
        if (this.lastSync) {
            baseConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 10);
        const siloBagPromises = fieldChunks.map(chunk => 
            getDocs(query(collection(db, 'silo_bags'), ...baseConstraints, where('field.id', 'in', chunk)))
        );
        const siloBagsSnapshots = await Promise.all(siloBagPromises);
        const siloBagsSnap = { docs: siloBagsSnapshots.flatMap(snap => snap.docs) };
        
        return siloBagsSnap;
    }

    private async loadLogistics(fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };

        const securityConstraints = createSecurityQuery(this.user).build();
        const baseConstraints = [...securityConstraints, where('status', 'in', ['in-route-to-field', 'in-field'])];
        if (this.lastSync) {
            baseConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 10);
        const logisticsPromises = fieldChunks.map(chunk => 
            getDocs(query(collection(db, 'logistics'), ...baseConstraints, where('field.id', 'in', chunk)))
        );
        const logisticsSnapshots = await Promise.all(logisticsPromises);
        return { docs: logisticsSnapshots.flatMap(snap => snap.docs) };
    }
    
    private async loadCriticalSubcollections(sessions: QueryDocumentSnapshot[], siloBagsSnap: QueryDocumentSnapshot[]) {
        if (sessions.length === 0 && siloBagsSnap.length === 0) return;

        const baseConstraints = createSecurityQuery(this.user).withFieldAccess('field.id').build();
        if (this.lastSync) {
            baseConstraints.push(where('updated_at', '>', this.lastSync));
        }

        const registerPromises = sessions.map(session =>
            getDocs(query(collection(db, 'harvest_sessions', session.id, 'registers'), ...baseConstraints, orderBy('date', 'desc'), limit(10)))
                .catch(() => ({ docs: [] }))
        );

        const movementPromises = siloBagsSnap.map((siloDoc) =>
            getDocs(query(collection(db, 'silo_bags', siloDoc.id, 'movements'), ...baseConstraints, orderBy('date', 'desc'), limit(10)))
                .catch(() => ({ docs: [] }))
        );

        await Promise.all([...registerPromises, ...movementPromises]);
    }
}

export const primeOfflineCache = async (user: User): Promise<void> => {
    const priming = new PrimingService();
    await priming.prime(user);
};