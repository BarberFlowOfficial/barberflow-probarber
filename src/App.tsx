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
    // Track if we started with a token to prevent immediate redirect while validating
    const [startedWithToken] = useState(() => window.location.hash.includes('access_token'));

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
        // If we started with a token, explicitly show "Sincronizando..."
        if (startedWithToken) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF9D]/20 border-t-[#00FF9D] rounded-full animate-spin"></div>
                    <span className="text-zinc-400 text-sm">Sincronizando...</span>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF9D]/20 border-t-[#00FF9D] rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }
    // 2. Auth Check
    // Prevent redirect if we are simply waiting for shopId but have a session (handled by AuthContext)
    // ONLY redirect if we are truly unauthenticated AND didn't start with a token claim
    if (!session && !startedWithToken) {
        window.location.href = '/login';
        return null;
    }

    // Access Denied / No Shop (If authenticated but no shop found)
    if (session && !shopId && !isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
                    <p className="text-zinc-400">Você não tem permissão para acessar esta área.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-4 px-4 py-2 bg-[#00FF9D] text-black font-medium rounded-lg"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        );
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