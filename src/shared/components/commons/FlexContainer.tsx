import React from 'react';

interface FlexContainerProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'row' | 'col';
    fullHeight?: boolean;
}

/**
 * Componente contenedor flex optimizado para layouts móviles
 * Maneja automáticamente la altura completa y distribución del espacio
 */
const FlexContainer: React.FC<FlexContainerProps> = ({
    children,
    className = '',
    direction = 'col',
    fullHeight = true
}) => {
    const baseClasses = `flex flex-${direction}`;
    const heightClasses = fullHeight ? "h-full" : "";
    const combinedClasses = `${baseClasses} ${heightClasses} ${className}`.trim();

    return (
        <div className={combinedClasses}>
            {children}
        </div>
    );
};

export default FlexContainer;
