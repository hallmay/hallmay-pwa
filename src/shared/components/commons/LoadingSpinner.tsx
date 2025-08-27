import type { FC } from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = "Cargando datos..." }) => (
    <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark mx-auto mb-4"></div>
        <p className="text-text-secondary">{message}</p>
    </div>
);

export default LoadingSpinner;