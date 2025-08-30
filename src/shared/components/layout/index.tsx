import React, { useEffect, useRef, useState } from 'react';
import { ChartColumnIncreasing, Archive, Tractor, Truck } from "lucide-react";
import { DesktopSidebar } from './desktop/Sidebar';
import { MobileHeader } from './mobile/Header';
import { MobileBottomNav } from './mobile/BottomBar';
import { DesktopHeader } from './desktop/Header'
import { Outlet } from 'react-router';

const navItems = [
    { name: 'Cosecha', icon: Tractor, path: '/' }, 
    { name: 'Logística', icon: Truck, path: '/logistics',roles: ['admin', 'manager', 'superadmin'] },
    { name: 'Silobolsas', icon: Archive, path: '/silo-bags', roles: ['admin', 'manager', 'superadmin'] },
    {
        name: 'Reportes',
        icon: ChartColumnIncreasing,
        path: '/reports',
        roles: ['admin', 'field-owner', 'superadmin']
    },
];

const Layout: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background text-text-primary">
            <DesktopSidebar
                navItems={navItems}
            />

            <div className="flex-1 flex flex-col lg:ml-20">
                <header>
                    <MobileHeader
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                        menuRef={menuRef}
                    />
                    <DesktopHeader
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                        menuRef={menuRef}
                    />
                </header>
                {/* <RefreshBanner /> */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
                    <div className="mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

                <MobileBottomNav
                    navItems={navItems}
                />
            </div>
        </div>
    );
};

export default Layout;