import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useData } from "../../context/data/DataProvider";
import useAuth from "../../context/auth/AuthContext";
import { type FC, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const SyncIndicator: FC = () => {
    const { currentUser } = useAuth();
    const { syncStatus, lastPrime } = useData();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!currentUser) {
        return null;
    }

    const getStatusConfig = () => {
        if (!isOnline) return {
            Icon: WifiOff,
            text: "Sin Conexión",
            colorClasses: "bg-gray-100 text-gray-500",
            tooltip: "La app funciona con los últimos datos guardados.",
            disabled: true
        };
        if (syncStatus === 'error') return {
            Icon: AlertCircle,
            text: "Error",
            colorClasses: "bg-red-100 text-red-600",
            tooltip: "Error en la última sincronización. Haz clic para reintentar.",
            disabled: false
        };
        if (syncStatus === 'syncing') return {
            Icon: RefreshCw,
            text: "Sincronizando",
            colorClasses: "bg-blue-100 text-blue-600",
            tooltip: "Sincronizando datos...",
            disabled: true
        };
        if (lastPrime) {
            const timeAgo = formatDistanceToNow(lastPrime, { addSuffix: true, locale: es });
            return {
                Icon: CheckCircle,
                text: "Sincronizado",
                colorClasses: "bg-green-100 text-green-600",
                tooltip: `Última vez ${timeAgo}. Haz clic para buscar actualizaciones.`,
                disabled: false
            };
        }
        return {
            Icon: Wifi,
            text: "Online",
            colorClasses: "bg-gray-100 text-gray-600",
            tooltip: "Conectado. Haz clic para sincronizar.",
            disabled: false
        };
    };

    const { Icon, text, colorClasses, tooltip, disabled } = getStatusConfig();
    const isSpinning = syncStatus === 'syncing';

    return (
        <button
            disabled={disabled || syncStatus === 'syncing'}
            title={tooltip}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed ${colorClasses}`}
        >
            <Icon size={16} className={isSpinning ? 'animate-spin' : ''} />
            <span>{text}</span>
        </button>
    );
};

export default SyncIndicator;