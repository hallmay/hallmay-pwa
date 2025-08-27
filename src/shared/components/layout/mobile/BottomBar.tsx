import React from 'react';
import type { LucideProps } from 'lucide-react';
// 1. Se importa NavLink y useAuth
import { NavLink } from 'react-router';
import useAuth from '../../../context/auth/AuthContext';

interface NavItem {
    name: string;
    icon: React.ElementType<LucideProps>;
    path: string;
    roles?: string[];
}

interface MobileBottomNavProps {
    navItems: NavItem[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ navItems }) => {
    // 4. Se obtiene el usuario del contexto
    const { currentUser } = useAuth();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary h-20 flex items-center justify-around rounded-t-2xl shadow-top z-40">
            {navItems.map((item) => {
                // 5. Se filtra por rol antes de renderizar
                const canView = !item.roles || (currentUser && item.roles.includes(currentUser.role));

                if (!canView) {
                    return null; // No se renderiza el ítem si no tiene permiso
                }

                const Icon = item.icon;
                return (
                    // 6. Se reemplaza <button> por <NavLink>
                    <NavLink
                        key={item.name}
                        to={item.path}
                        // 7. Se usan las clases condicionales basadas en 'isActive'
                        className={({ isActive }) =>
                            `flex-1 h-full flex flex-col items-center justify-center space-y-1 transition-colors rounded-lg ${isActive ? 'bg-primary-darker' : 'hover:bg-primary-darker'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={24}
                                    className={`text-white transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'
                                        }`}
                                />
                                <span
                                    className={`text-xs font-medium text-white transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
};