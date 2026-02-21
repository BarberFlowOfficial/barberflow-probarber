import React, { useState, useEffect, useRef } from 'react';
import {
    TrendingUp,
    Lock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Clock,
    Calendar as CalendarIcon,
    ChevronDown,
    Eye,
    EyeOff,
    Pause
} from 'lucide-react';
import { ShopAvatar } from './ShopAvatar';
import { useAuth } from '../contexts/AuthContext';
import { Shop, getBarberDashboardData, BarberDashboardData, UpcomingAppointment, toggleBarberAvailability } from '../lib/services/barberService';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { NextClientCard } from './NextClientCard';
import { WithdrawalModal } from './WithdrawalModal';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface BarberDashboardProps {
    onMenuOpen: () => void;
    onProfileClick?: () => void;
    onNavigate: (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => void;
    shop?: Shop | null;
}

const BarberDashboard: React.FC<BarberDashboardProps> = ({ onNavigate, onProfileClick, shop }) => {
    const auth = useAuth();
    const user = auth.user || auth.session?.user;
    const { userProfile } = auth;
    const authLoading = auth.isLoading;

    const [showValues, setShowValues] = useState(true);
    const [isBlinking, setIsBlinking] = useState(false);
    // Initialize paused state based on profile.active (inverse logic: active=true -> paused=false)
    const [isAgendaPaused, setIsAgendaPaused] = useState(userProfile ? !userProfile.active : false);

    // Filter State
    const [filterMode, setFilterMode] = useState<'day' | 'week' | 'month' | 'custom'>('month');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<BarberDashboardData | null>(null);
    const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
    const [isSyncingBalance, setIsSyncingBalance] = useState(false);
    const lastSyncRef = useRef(0);

    const fetchDashboardData = async () => {
        // Guarantee user.id from auth context, session, or loaded profile
        // This must match the ID seen in [barberService] getUserProfessionalProfile
        const userId = user?.id || auth.session?.user?.id || userProfile?.user_id;

        console.log('[Dashboard] Resolving userId:', {
            contextUser: user?.id,
            sessionUser: auth.session?.user?.id,
            profileUserId: userProfile?.user_id,
            finalUserId: userId
        });

        if (userId) {
            try {
                console.log('[Dashboard] Starting fetch for userId:', userId);

                // Keep loading true while fetching if no data
                if (!dashboardData) setIsLoading(true);

                const now = new Date();
                let start = startOfDay(now);
                let end = endOfDay(now);

                // Determine dates based on filter
                if (filterMode === 'week') {
                    start = startOfWeek(now, { weekStartsOn: 1 });
                    end = endOfWeek(now, { weekStartsOn: 1 });
                } else if (filterMode === 'month') {
                    start = startOfMonth(now);
                    end = endOfMonth(now);
                }

                console.log('[Dashboard] Calling getBarberDashboardData service...', { userId, start: start.toISOString(), end: end.toISOString() });

                // Call service with strict userId
                const data = await getBarberDashboardData(userId, start.toISOString(), end.toISOString());

                console.log('💰 Ganhos calculados do JSONB:', data.total_earnings);
                console.log('[Dashboard] Fetch success:', data);
                setDashboardData(data);
                setUpcomingAppointments(data.upcoming_appointments);

                // Salva o ID que acabou de ser usado com sucesso
                localStorage.setItem('barberflow_user_id', userId);
                console.log('[Dashboard] ID validado e salvo no cache:', userId);

                // Only update availability from dashboard if not manually toggled recently? 
                // For now, trust the server truth.
                setIsAgendaPaused(!data.is_active);
            } catch (error) {
                console.error("[Dashboard] Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const userId = user?.id || auth.session?.user?.id || userProfile?.user_id;
        console.log('[Dashboard] Effect triggered:', {
            hasUser: !!user,
            userId,
            authLoading,
            filterMode
        });

        if (userId) {
            fetchDashboardData();
        } else {
            // If still loading auth, keep loading. If auth done and no user, stop loading (or redirect).
            if (!authLoading) {
                setIsLoading(false);
            }
        }
    }, [user?.id, auth.session?.user?.id, userProfile?.user_id, authLoading, filterMode]);

    useEffect(() => {
        const syncBalance = async () => {
            const userId = user?.id || auth.session?.user?.id || userProfile?.user_id;
            const shopId = userProfile?.shopId || shop?.id;

            if (!shopId || !userId) {
                console.warn("[Dashboard] Sincronização abortada: IDs ausentes", { shopId, userId });
                setIsSyncingBalance(false);
                return;
            }

            const now = Date.now();
            if (now - lastSyncRef.current < 60000) return;

            console.log('[Dashboard] Iniciando sincronização de saldo com Asaas...');
            console.log("Payload Sync:", { shopId, userId });

            setIsSyncingBalance(true);
            try {
                const { data, error } = await supabase.functions.invoke('sync-asaas-balance', {
                    body: { shopId, userId }
                });

                if (error) throw error;

                if (data) {
                    console.log('[Dashboard] Saldo sincronizado com sucesso:', data);
                    setDashboardData(prev => prev ? ({
                        ...prev,
                        wallet: {
                            ...prev.wallet,
                            balance: Number(data.balance || 0),
                            reserved_balance: Number(data.reserved_balance || 0)
                        }
                    }) : prev);
                    lastSyncRef.current = Date.now();
                }
            } catch (err) {
                console.error('[Dashboard] Erro na sincronização de saldo Asaas:', err);
            } finally {
                setIsSyncingBalance(false);
            }
        };

        syncBalance();
    }, [userProfile?.shopId, shop?.id, user?.id, auth.session?.user?.id, userProfile?.user_id]);

    const formatTime = (timeString: string) => {
        if (!timeString) return '--:--';
        try {
            if (timeString.includes('T') || timeString.includes('-')) {
                return format(new Date(timeString), 'HH:mm');
            }
            return timeString.split(':').slice(0, 2).join(':');
        } catch (e) {
            return timeString;
        }
    };

    const earnings = {
        total: dashboardData?.total_earnings || 0,
        day: dashboardData?.total_earnings || 0,
        week: dashboardData?.total_earnings || 0,
        month: dashboardData?.total_earnings || 0,
        custom: 0.00
    };

    const vault = {
        reserved: dashboardData?.wallet?.reserved_balance || 0,
        available: dashboardData?.wallet?.balance || 0
    };

    const togglePrivacy = () => {
        setIsBlinking(true);
        setTimeout(() => {
            setShowValues(!showValues);
            setIsBlinking(false);
        }, 200);
    };

    const renderValue = (value: number) => {
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

        return (
            <span className={`transition-all duration-300 ${showValues ? '' : 'blur-sm select-none'}`}>
                {showValues ? formatted : 'R$ •••••'}
            </span>
        );
    };

    const handleToggleAvailability = async () => {
        // Use barberId from profile first, then dashboard data
        const barberId = userProfile?.barberId || dashboardData?.barber_id;

        console.log('[handleToggleAvailability] IDs:', {
            profileBarberId: userProfile?.barberId,
            dashboardBarberId: dashboardData?.barber_id,
            resolvedBarberId: barberId
        });

        if (!barberId) {
            console.error('❌ [BarberDashboard] Falha ao alternar pausa: Barber ID não encontrado.');
            return;
        }

        // Optimistic Update: Toggle immediately
        const previousState = isAgendaPaused;
        setIsAgendaPaused(!previousState);
        setIsBlinking(true);

        try {
            // Call the service
            const result = await toggleBarberAvailability(barberId);
            console.log('✅ [BarberDashboard] Resultado toggle:', result);

            // Fetch to ensure data consistency, but UI is already updated
            await fetchDashboardData();

            setTimeout(() => {
                setIsBlinking(false);
            }, 1000);

        } catch (error) {
            console.error('❌ [BarberDashboard] Erro ao alternar disponibilidade:', error);
            // Revert on error
            setIsAgendaPaused(previousState);
            alert('Falha ao alterar o status da agenda. Verifique sua conexão.');
            setIsBlinking(false);
        }
    };
    // Card Styles
    const bentoCardClass = "relative h-full rounded-[32px] bg-[#0A0A0A] border border-white/[0.05] overflow-hidden group shadow-2xl shadow-black/40 transition-all duration-500 hover:border-white/10";
    const BentoGridBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-[32px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#050505] p-6 md:p-10 font-sans text-zinc-100 pb-32">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                            Olá, {userProfile?.name?.split(' ')[0] || dashboardData?.barber_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Barbeiro'}
                        </h1>
                        <p className="text-xs text-zinc-500 font-medium tracking-wide">Bem-vindo de volta</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleAvailability}
                        disabled={isBlinking || (!userProfile?.barberId && !dashboardData?.barber_id)}
                        className={`relative p-3 rounded-full border transition-all duration-300 group ${isAgendaPaused
                            ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-[#00FF9D]/10 border-[#00FF9D]/20 text-[#00FF9D] hover:bg-[#00FF9D]/20 shadow-[0_0_15px_rgba(0,255,157,0.1)]'
                            } ${isBlinking || (!userProfile?.barberId && !dashboardData?.barber_id) ? 'animate-pulse scale-110 opacity-50 cursor-wait' : ''}`}
                    >
                        <Pause size={20} className={isAgendaPaused ? 'fill-current' : ''} />
                        {isAgendaPaused && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>

                    <button className="flex md:hidden items-center gap-2 p-2 rounded-full bg-[#0A0A0A] border border-white/5" onClick={() => onProfileClick ? onProfileClick() : onNavigate('profile')}>
                        <ShopAvatar
                            name={userProfile?.name || dashboardData?.barber_name || user?.user_metadata?.name || "Barbeiro"}
                            imageUrl={userProfile?.avatar_url || dashboardData?.barber_photo || null}
                            size="sm"
                        />
                    </button>

                    {/* Desktop Profile Link */}
                    <button
                        onClick={() => onProfileClick ? onProfileClick() : onNavigate('profile')}
                        className="hidden md:flex items-center gap-2 p-2 pr-4 rounded-full bg-[#0A0A0A] border border-white/5 hover:bg-white/5 transition-all"
                    >
                        <ShopAvatar
                            name={userProfile?.name || dashboardData?.barber_name || user?.user_metadata?.name || "Barbeiro"}
                            imageUrl={userProfile?.avatar_url || dashboardData?.barber_photo || null}
                            size="sm"
                        />
                        <span className="text-sm font-medium text-zinc-300">Minha Conta</span>
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF9D]/20 border-t-[#00FF9D] rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium animate-pulse">Carregando dashboard...</p>
                </div>
            ) : (
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">

                    {/* 1. Earnings Card */}
                    <div className={`${bentoCardClass} col-span-1 lg:col-span-2`}>
                        <BentoGridBackground />
                        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#00FF9D]/5 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#00FF9D]/10 rounded-lg border border-[#00FF9D]/10 text-[#00FF9D]">
                                        <TrendingUp size={18} />
                                    </div>
                                    <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-wide">Meus Ganhos</h2>
                                    <button onClick={togglePrivacy} className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 transition-colors">
                                        {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>

                                {/* Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-zinc-300 hover:text-white"
                                    >
                                        <CalendarIcon size={14} />
                                        <span className="capitalize hidden md:block">{filterMode === 'day' ? 'Hoje' : filterMode === 'week' ? 'Esta Semana' : filterMode === 'month' ? 'Este Mês' : 'Personalizado'}</span>
                                        <ChevronDown size={14} className="hidden md:block" />
                                    </button>

                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-40 bg-[#121214] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                                {['day', 'week', 'month'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => {
                                                            setFilterMode(mode as any);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${filterMode === mode ? 'text-[#00FF9D] bg-[#00FF9D]/5' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {mode === 'day' ? 'Hoje' : mode === 'week' ? 'Esta Semana' : 'Este Mês'}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Total no período</span>
                                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
                                    {renderValue(earnings.total)}
                                </h3>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-medium">
                                <span>* Valores brutos estimados</span>
                                <span className="text-[#00FF9D]">Dados em tempo real</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Vault (Cofre) Card - MOVED UP */}
                    <div className={`${bentoCardClass} col-span-1`}>
                        <BentoGridBackground />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF9D]/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#00FF9D]/10 rounded-xl text-[#00FF9D] border border-[#00FF9D]/20">
                                        <Lock size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg text-white">Meu Cofre</h3>
                                </div>
                                {isSyncingBalance && (
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-[#00FF9D]/30 border-t-[#00FF9D] rounded-full animate-spin" />
                                        <span className="text-[10px] text-[#00FF9D]/60 uppercase font-bold tracking-wider">Sincronizando</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 flex-1">
                                {/* Reserved */}
                                <div className="p-4 rounded-2xl bg-[#050505] border border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={18} className="text-zinc-500" />
                                        <span className="text-sm text-zinc-400 font-medium">No Cofre</span>
                                    </div>
                                    <span className="text-zinc-500/60 font-bold">{renderValue(vault.reserved)}</span>
                                </div>

                                {/* Available */}
                                <div className="p-4 rounded-2xl bg-[#050505] border border-white/5 flex justify-between items-center group/item hover:border-[#00FF9D]/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-[#00FF9D]" />
                                        <span className="text-sm text-zinc-300 font-medium">Disponível</span>
                                    </div>
                                    <span className="text-white font-bold text-lg">{renderValue(vault.available)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsWithdrawalOpen(true)}
                                className="relative z-10 w-full mt-8 py-4 rounded-2xl border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/10 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                            >
                                Solicitar Saque
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="col-span-1 lg:col-span-3">
                        {upcomingAppointments.length === 0 ? (
                            <div className={`${bentoCardClass} p-12 flex flex-col items-center justify-center gap-4 text-center`}>
                                <BentoGridBackground />
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                                    <Clock size={32} className="text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Sem agendamentos para hoje</h3>
                                    <p className="text-zinc-500 text-sm">Aproveite para descansar ou organizar suas ferramentas!</p>
                                </div>
                            </div>
                        ) : (
                            <NextClientCard
                                upcomingAppointments={upcomingAppointments}
                                onSelectClient={setSelectedClient}
                                formatTime={formatTime}
                            />
                        )}
                    </div>

                </main>
            )}
            <AppointmentDetailsModal
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onConfirm={() => fetchDashboardData()}
            />
            {dashboardData?.wallet && (
                <WithdrawalModal
                    isOpen={isWithdrawalOpen}
                    onClose={() => setIsWithdrawalOpen(false)}
                    shopId={userProfile?.shopId || shop?.id || ''}
                    userId={user?.id || auth.session?.user?.id || userProfile?.user_id || ''}
                    walletData={dashboardData.wallet}
                    onSuccess={() => fetchDashboardData()}
                />
            )}
        </div>
    );
};

export default BarberDashboard;
