// src/hooks/useDeviceType.ts
import { useState, useEffect, useMemo, useCallback } from 'react';

const detectMobileOrTablet = () => {
    // 1. Verificar User Agent primero (más confiable)
    const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera;

    // Detectar móviles por User Agent
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    if (mobileRegex.test(userAgent)) {
        return true;
    }

    // 2. Verificar ancho de pantalla (tablets pueden tener pantallas grandes)
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const minDimension = Math.min(screenWidth, screenHeight);
    const maxDimension = Math.max(screenWidth, screenHeight);

    // Considerar móvil si el ancho mínimo es menor a 768px
    if (minDimension < 768) {
        return true;
    }

    // Considerar tablet si está entre 768-1024px y tiene touch
    if (minDimension >= 768 && minDimension <= 1024 && maxDimension <= 1366) {
        // Verificar si es realmente un dispositivo táctil primario
        if ('ontouchstart' in window && navigator.maxTouchPoints > 1) {
            return true;
        }
    }

    // 3. Verificar si es primariamente táctil (pero no en laptops grandes)
    if (minDimension > 1024) {
        // Pantallas grandes (>1024px) probablemente son desktop, incluso con touch
        return false;
    }

    // 4. Media queries como último recurso
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
        // Pero solo si la pantalla no es muy grande
        return minDimension < 1200;
    }

    return false;
};

export const useDeviceType = () => {
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(detectMobileOrTablet());

    // Memoizar el handler para evitar recreaciones
    const handleResize = useCallback(() => {
        const newIsMobile = detectMobileOrTablet();
        setIsMobileOrTablet(prevState => {
            // Solo actualizar si cambió realmente
            return prevState !== newIsMobile ? newIsMobile : prevState;
        });
    }, []);

    useEffect(() => {
        // Solo agregar listener si realmente necesitamos detectar cambios
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Memoizar el resultado para evitar re-renders innecesarios
    return useMemo(() => ({ isMobileOrTablet }), [isMobileOrTablet]);
};