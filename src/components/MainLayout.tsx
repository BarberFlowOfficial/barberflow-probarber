import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BarberSidebar } from './BarberSidebar';
import { MobileMenu } from './MobileMenu';
import { BarberProfileDrawer } from './BarberProfileDrawer';
import { Shop } from '../../lib/services/barberService';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile';
    onNavigate: (view: any) => void;
    shop: Shop | null;
    isProfileOpen: boolean;
    onProfileClose: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    currentView,
    onNavigate,
    shop,
    isProfileOpen,
    onProfileClose
}) => {
    const { userRole } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const isBarber = userRole === 'barber';

    return (
        <div className="flex min-h-screen bg-[#050505]">
            {/* Desktop Sidebar */}
            {isBarber ? (
                <BarberSidebar
                    currentView={currentView}
                    onNavigate={onNavigate}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            ) : (
                <Sidebar
                    currentView={currentView}
                    onNavigate={onNavigate}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    // @ts-ignore
                    shop={shop}
                />
            )}

            {/* Mobile Menu / Profile Menu */}
            {isBarber ? (
                <BarberProfileDrawer
                    isOpen={isProfileOpen}
                    onClose={onProfileClose}
                    onNavigate={onNavigate}
                    shop={shop}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
            ) : (
                <MobileMenu
                    isOpen={isProfileOpen}
                    onClose={onProfileClose}
                    currentView={currentView}
                    onNavigate={onNavigate}
                    shop={shop}
                />
            )}

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ease-in-out w-full ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-72'}`}>
                {children}
            </div>
        </div>
    );
};
