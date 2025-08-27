import { LogOut, User } from "lucide-react";
import useAuth from "../../../context/auth/AuthContext";
import hLogo from "../../../../assets/logo.png";
import SyncIndicator from "../../commons/SyncIndicator";

interface MobileHeaderProps {
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (isOpen: boolean) => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ isUserMenuOpen, setIsUserMenuOpen, menuRef }) => {
    const { logout } = useAuth();

    // Función para manejar el logout de forma más robusta
    const handleLogout = async (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            setIsUserMenuOpen(false);
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="lg:hidden sticky top-0 bg-secondary p-4 rounded-b-2xl z-40 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10">
                    <img src={hLogo} alt="Logo de Hallmay" className="h-full w-full object-contain" />
                </div>
                <div className="flex items-center gap-3">
                    <SyncIndicator />

                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-10 h-10 bg-primary-darker rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors touch-manipulation"
                        >
                            <User size={20} />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-12 bg-surface border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-50 animate-fade-in-fast">
                                <button
                                    onClick={handleLogout}
                                    onTouchStart={handleLogout} // Añadido para mejor soporte móvil
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 touch-manipulation active:bg-red-100"
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};