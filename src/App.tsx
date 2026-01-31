import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import BarberDashboard from '../components/BarberDashboard';
import { getShop } from '../lib/services/barberService';
import type { Shop } from '../lib/services/barberService';
import { MainLayout } from './components/MainLayout';

type DashboardView = 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile';
const AppContent: React.FC = () => {
    const { session, shopId, isLoading } = useAuth();
    const [shopData, setShopData] = useState<Shop | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const fetchShop = async () => {
            if (shopId) {
                try {
                    const data = await getShop(shopId);
                    if (data) setShopData(data);
                } catch (error) {
                    console.error('Error fetching shop data:', error);
                }
            }
        };
        fetchShop();
    }, [shopId]);
    // 1. Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF9D]/20 border-t-[#00FF9D] rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }
    // 2. Auth Check
    if (!session) {
        return null; // AuthContext handles redirect/login state
    }

    // 3. Main Render
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100">
            <MainLayout
                currentView="dashboard"
                onNavigate={(view: DashboardView) => console.log('Navegar para:', view)}
                shop={shopData}
                isProfileOpen={isProfileOpen}
                onProfileClose={() => setIsProfileOpen(false)}
            >
                <BarberDashboard
                    shop={shopData}
                    onMenuOpen={() => setIsProfileOpen(true)}
                    onProfileClick={() => setIsProfileOpen(true)}
                    onNavigate={(view: DashboardView) => console.log('Navegar para:', view)}
                />
            </MainLayout>
        </div>
    );
};
const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);
export default App;