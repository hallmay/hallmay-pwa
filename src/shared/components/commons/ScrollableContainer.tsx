import React from 'react';

interface ScrollableContainerProps {
    children: React.ReactNode;
    className?: string;
    maxHeight?: string;
    showScrollbarOnDesktop?: boolean;
}

/**
 * Componente contenedor optimizado para scroll en mobile y desktop
 * Aplica las mejores prácticas para scrolling en mobile:
 * - Smooth scrolling nativo
 * - -webkit-overflow-scrolling: touch para iOS
 * - overscroll-behavior para evitar bounce en navegadores
 * - Padding bottom adicional en mobile para evitar que el contenido quede detrás de elementos fixed
 */
const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
    children,
    className = '',
    maxHeight = '60vh',
    showScrollbarOnDesktop = false
}) => {
    const scrollClasses = [
        'scroll-container',
        'mobile-scroll',
        'overflow-y-auto',
        'overscroll-contain',
        maxHeight && `max-h-[${maxHeight}]`,
        !showScrollbarOnDesktop && 'hide-scrollbar-desktop',
        'pb-4', // Padding bottom para mobile
        className
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={scrollClasses}
            style={{
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
            }}
        >
            {children}
        </div>
    );
};

export default ScrollableContainer;
