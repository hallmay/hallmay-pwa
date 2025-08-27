import React from 'react';
import { User, Briefcase, LogOut } from 'lucide-react';
import useAuth from '../../../context/auth/AuthContext';

// -- Cabecera para Escritorio --
interface DesktopHeaderProps {
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (isOpen: boolean) => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isUserMenuOpen, setIsUserMenuOpen, menuRef }) => {
    const { logout } = useAuth();
    return (
        <div className="hidden lg:flex items-center justify-between p-6 bg-secondary rounded-bl-1xl">
            <h1 className="text-white text-3xl font-semibold">Hallmay</h1>
            <div className="flex items-center space-x-4">
                <a
                    href="/backoffice"
                    target='_blank'
                    className="flex items-center space-x-2 bg-white text-primary-darker px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    <Briefcase size={16} />
                    <span>IR AL BACKOFFICE</span>
                </a>
                <div className="w-px h-6 bg-primary-darker"></div>
                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-10 h-10 bg-primary-darker rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                    >
                        <User size={20} />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-12 bg-surface border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-50 animate-fade-in-fast">
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut size={16} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}