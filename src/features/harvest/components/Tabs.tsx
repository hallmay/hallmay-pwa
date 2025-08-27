import type { FC } from "react";

interface HarvestTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabButton: FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 sm:px-4 font-semibold text-sm rounded-lg transition-colors ${isActive ? 'bg-primary-light text-primary-dark' : 'text-text-secondary hover:bg-gray-100'}`}
    >
        {children}
    </button>
);

const Tabs: FC<HarvestTabsProps> = ({ activeTab, setActiveTab }) => (
    <div className="flex space-x-1 sm:space-x-2 bg-background p-1 rounded-xl">
        <TabButton isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>Todos</TabButton>
        <TabButton isActive={activeTab === 'in-progress'} onClick={() => setActiveTab('in-progress')}>En Progreso</TabButton>
        <TabButton isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Pendientes</TabButton>
        <TabButton isActive={activeTab === 'finished'} onClick={() => setActiveTab('finished')}>Finalizados</TabButton>
    </div>
);

export default Tabs;