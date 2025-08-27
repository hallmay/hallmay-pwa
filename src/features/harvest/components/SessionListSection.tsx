// src/components/dashboards/harvest/SessionsListSection.tsx
import { type FC, useState, useMemo } from 'react';
import Card from '../../../shared/components/commons/Card';
import StatusBadge from '../../../shared/components/commons/StatusBadge';
import SessionCardList from './SessionCardList';
import type { HarvestSession } from '../../../shared/types';

interface SessionsListSectionProps {
    sessions: HarvestSession[];
    loading?: boolean;
    selectedFieldId?: string;
    className?: string;
}

const SessionsListSection: FC<SessionsListSectionProps> = ({
    sessions,
    loading = false,
    selectedFieldId = 'all',
    className = ''
}) => {
    const [activeListTab, setActiveListTab] = useState<'in-progress' | 'pending'>('in-progress');

    const { inProgressSessions, pendingSessions } = useMemo(() => {
        if (!sessions?.length) return { inProgressSessions: [], pendingSessions: [] };

        // Filtrar por campo si está seleccionado
        const filteredSessions = selectedFieldId === 'all'
            ? sessions
            : sessions.filter(session => session.field?.id === selectedFieldId);

        // Separar por estado
        const inProgress = filteredSessions.filter(session =>
            session.status === 'in-progress'
        );

        const pending = filteredSessions.filter(session =>
            session.status === 'pending'
        );

        // Transformar a formato esperado por SessionCardList
        const inProgressSessions = inProgress.map(session => ({
            id: session.id,
            name: session.plot?.name || 'Sin nombre',
            field: { name: session.field?.name || 'Sin campo' },
            crop: { name: session.crop?.name || 'Sin cultivo' },
            progress: session.harvested_hectares && session.hectares
                ? Math.round((session.harvested_hectares / session.hectares) * 100)
                : 0
        }));

        const pendingSessions = pending.map(session => ({
            id: session.id,
            name: session.plot?.name || 'Sin nombre',
            field: { name: session.field?.name || 'Sin campo' },
            crop: { name: session.crop?.name || 'Sin cultivo' }
        }));

        return { inProgressSessions, pendingSessions };
    }, [sessions, selectedFieldId]);

    if (loading) {
        return (
            <div className={className}>
                {/* Vista Desktop */}
                <div className="hidden lg:flex flex-col lg:flex-row gap-4 lg:gap-6">
                    <Card className="flex-1">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                    <Card className="flex-1">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Vista Mobile */}
                <div className="lg:hidden">
                    <Card>
                        <div className="animate-pulse">
                            <div className="flex border-b border-gray-200 mb-6">
                                <div className="w-1/2 h-12 bg-gray-100 rounded-t"></div>
                                <div className="w-1/2 h-12 bg-gray-100 rounded-t"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Vista Desktop - Dos columnas */}
            <div className="hidden lg:flex flex-col lg:flex-row gap-4 lg:gap-6">
                <Card className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            Lotes en cosecha
                        </h3>
                        <StatusBadge status="in-progress" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <SessionCardList
                            sessions={inProgressSessions}
                            showProgress={true}
                        />
                    </div>
                </Card>

                <Card className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            Lotes Pendientes
                        </h3>
                        <StatusBadge status="pending" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <SessionCardList sessions={pendingSessions} />
                    </div>
                </Card>
            </div>

            {/* Vista Mobile - Pestañas */}
            <div className="lg:hidden">
                <Card>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => setActiveListTab('in-progress')}
                                className={`py-4 px-1 border-b-2 font-semibold text-sm text-center w-1/2 ${activeListTab === 'in-progress'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>Lotes en cosecha</span>
                                <div className="mt-1">
                                    <StatusBadge status='in-progress' />
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveListTab('pending')}
                                className={`py-4 px-1 border-b-2 font-semibold text-sm text-center w-1/2 ${activeListTab === 'pending'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>Lotes pendientes</span>
                                <div className="mt-1">
                                    <StatusBadge status='pending' />
                                </div>
                            </button>
                        </nav>
                    </div>
                    <div className="pt-6">
                        {activeListTab === 'in-progress'
                            ? <SessionCardList sessions={inProgressSessions} showProgress={true} />
                            : <SessionCardList sessions={pendingSessions} />
                        }
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SessionsListSection;