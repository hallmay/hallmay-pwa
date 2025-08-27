import React from 'react';
import { type LucideProps } from 'lucide-react';
import useAuth from '../../../context/auth/AuthContext';
import { NavLink } from 'react-router';
import logo from '../../../../assets/logo.png'

interface NavItem {
    name: string;
    icon: React.ElementType<LucideProps>;
    path: string;
    // 2. Añade la propiedad opcional "roles" a la interfaz
    roles?: string[];
}

interface DesktopSidebarProps {
    navItems: NavItem[];
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ navItems }) => {
    const { currentUser } = useAuth();

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 w-20 h-full bg-secondary p-3 flex-col items-center z-50">
            <div className="w-14 h-14 flex items-center justify-center mt-2 mb-6">

                <img src={logo} alt="Logo de Hallmay" className="h-18 w-18 object-contain" />
            </div>
            <nav className="flex-1 flex flex-col space-y-3 items-center">
                {navItems.map((item) => {
                    const canView = !item.roles || (currentUser && item.roles.includes(currentUser.role));

                    if (!canView) return null;

                    const Icon = item.icon;
                    return (
                        <div key={item.name} className="relative group">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isActive
                                        ? 'bg-primary-darker text-white'
                                        : 'text-white hover:bg-primary-medium'
                                    }`
                                }
                            >
                                <Icon size={20} />
                            </NavLink>
                            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {item.name}
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};