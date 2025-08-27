import type { FC } from "react";

const getStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'finished': 'Finalizado',
        'in-progress': 'En Progreso',
        'En Progreso': 'En Progreso',
        'pending': 'Pendiente',
        'Pendiente': 'Pendiente'
    };
    return statusMap[status] || status;
};

const StatusBadge: FC<{ status: string, className?: string }> = ({ status, className = '' }) => {
    const normalizedStatus = getStatus(status);
    const baseStyles = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    const colorStyles: { [key: string]: string } = {
        'Pendiente': 'bg-orange-100 text-orange-800',
        'En Progreso': 'bg-blue-100 text-blue-800',
        'Finalizado': 'bg-green-100 text-green-800',
    };
    return (
        <span className={`${baseStyles} ${colorStyles[normalizedStatus] || 'bg-gray-100 text-gray-800'} ${className}`}>
            {normalizedStatus}
        </span>
    );
};

export default StatusBadge;