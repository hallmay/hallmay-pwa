import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";
import type { CampaignField, User } from "../types";
import { createSecurityQuery } from "../firebase/queryBuilder";

interface PrimingMetrics {
    totalQueries: number;
    totalDocuments: number;
    duration: number;
    stage: string;
    errors: string[];
    timings: Record<string, number>;
}

class PrimingService {
    private user: User | null = null;

    async prime(user: User): Promise<PrimingMetrics> {
        this.user = user;
        try {
            const lastSyncItem = localStorage.getItem('lastSync');
            const lastSyncTimestamp = lastSyncItem ? Timestamp.fromDate(new Date(lastSyncItem)) : null;

            if (lastSyncTimestamp) {
                console.log(`🔄 Sincronización incremental desde: ${lastSyncTimestamp.toDate().toLocaleString()}`);
            } else {
                console.log('🔄 Realizando sincronización completa inicial.');
            }

            const baseSecurityConstraints = createSecurityQuery(this.user).build();
            const fieldAccessConstraints = createSecurityQuery(this.user)
                .withFieldAccess('field.id')
                .build();

            let incrementalConstraints = [...baseSecurityConstraints];
            if (lastSyncTimestamp) {
                incrementalConstraints.push(where('updated_at', '>', lastSyncTimestamp));
            }

            const [
                activeCampaignSnap, _cropsSnap, _harvestersSnap,
                _destinationsSnap, _usersSnap, activeSiloBagsSnap,
                _activeLogisticsSnap
            ] = await Promise.all([
                getDocs(query(collection(db, 'campaigns'), ...baseSecurityConstraints, where('active', '==', true), limit(1))),
                getDocs(query(collection(db, 'crops'), ...incrementalConstraints)),
                getDocs(query(collection(db, 'harvesters'), ...incrementalConstraints)),
                getDocs(query(collection(db, 'destinations'), ...incrementalConstraints)),
                getDocs(query(collection(db, 'users'), ...incrementalConstraints)),
                getDocs(query(collection(db, 'silo_bags'), ...fieldAccessConstraints, where('status', '==', 'active'), orderBy('date', 'desc'), limit(50))),
                getDocs(query(collection(db, 'logistics'), ...fieldAccessConstraints, where('status', 'in', ['in-route-to-field', 'in-field']), orderBy('date', 'desc'), limit(50))),
            ]);

            const campaign = activeCampaignSnap.docs[0] ? { id: activeCampaignSnap.docs[0].id, ...activeCampaignSnap.docs[0].data() } : null;
            if (!campaign) {
                return;
            }

            const campaignFieldsSnap = await this.loadCampaignFields(campaign.id, lastSyncTimestamp);
            const allCampaignFieldIds = campaignFieldsSnap.docs.map((doc: any) => (doc.data() as CampaignField).field.id);

            const userAccessibleFields = this.user.accessibleFieldIds || [];
            const isAdmin = this.user.role === 'admin' || this.user.role === 'super-admin';

            const relevantFieldIds = isAdmin
                ? allCampaignFieldIds
                : allCampaignFieldIds.filter(fieldId => userAccessibleFields.includes(fieldId));

            await Promise.all([
                this.loadPlots(relevantFieldIds, lastSyncTimestamp),
                this.loadSessionsByFields(campaign.id, relevantFieldIds, lastSyncTimestamp)
            ]);

            const allSessionsSnap = await this.loadSessionsByFields(campaign.id, relevantFieldIds, null);
            const allSessions = allSessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            await this.loadCriticalSubcollections(allSessions, activeSiloBagsSnap);

            localStorage.setItem('lastSync', new Date().toISOString());

            return;

        } catch (error: any) {
            throw error;
        }
    }

    private async loadCampaignFields(campaignId: string, lastSync: Timestamp | null) {
        const securityConstraints = createSecurityQuery(this.user)
            .withFieldAccess('field.id')
            .build();

        let finalConstraints = [...securityConstraints, where('campaign.id', '==', campaignId)];
        if (lastSync) {
            finalConstraints.push(where('updated_at', '>', lastSync));
        }

        const finalQuery = query(collection(db, 'campaign_fields'), ...finalConstraints);
        return getDocs(finalQuery);
    }

    private async loadPlots(fieldIds: string[], lastSync: Timestamp | null) {
        if (fieldIds.length === 0) return { docs: [] };

        const baseConstraints = createSecurityQuery(this.user).build();
        if (lastSync) {
            baseConstraints.push(where('updated_at', '>', lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 30);
        const plotPromises = fieldChunks.map(chunk =>
            getDocs(query(collection(db, 'plots'), ...baseConstraints, where('field.id', 'in', chunk)))
        );
        const results = await Promise.all(plotPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadSessionsByFields(campaignId: string, fieldIds: string[], lastSync: Timestamp | null) {
        if (fieldIds.length === 0) return { docs: [] };

        const baseConstraints = createSecurityQuery(this.user).build();
        if (lastSync) {
            baseConstraints.push(where('updated_at', '>', lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 30);
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

    private async loadCriticalSubcollections(sessions: any[], siloBagsSnap: any) {
        if (sessions.length === 0 && siloBagsSnap.docs.length === 0) return;

        const baseConstraints = createSecurityQuery(this.user).withFieldAccess('field.id').build();
        const recentSessions = sessions.sort((a, b) => b.date.toMillis() - a.date.toMillis());

        const registerPromises = recentSessions.map(session =>
            getDocs(query(collection(db, 'harvest_sessions', session.id, 'registers'), ...baseConstraints, orderBy('date', 'desc'), limit(10)))
                .catch(() => ({ docs: [] }))
        );

        const movementPromises = siloBagsSnap.docs.map((siloDoc: any) =>
            getDocs(query(collection(db, 'silo_bags', siloDoc.id, 'movements'), ...baseConstraints, orderBy('date', 'desc'), limit(10)))
                .catch(() => ({ docs: [] }))
        );

        await Promise.all([...registerPromises, ...movementPromises]);
    }
}

export const primeOfflineCache = (user: User): Promise<PrimingMetrics> => {
    const priming = new PrimingService();
    return priming.prime(user);
};