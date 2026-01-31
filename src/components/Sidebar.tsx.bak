import React from 'react';
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    Scissors,
    Store,
    ShoppingBag,
    Gift,
    LogOut,
    ChevronLeft,
    ChevronRight,
    LucideIcon,
    BarChart3
} from 'lucide-react';
import logo from '../assests/logo.svg';

interface SidebarProps {
    currentView: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile';
    onNavigate: (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

interface NavItem {
    icon: React.ReactElement<LucideIcon>;
    label: string;
    id: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'marketplace' | 'shopping' | 'referral' | 'reports';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isCollapsed, onToggleCollapse, shop }) => {

    const handleNavigation = (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => {
        onNavigate(view);
    };

    const navItems: NavItem[] = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
        { icon: <Calendar size={20} />, label: 'Agendamentos', id: 'schedule' },
        { icon: <Wallet size={20} />, label: 'Finanças', id: 'finance' },
        { icon: <Scissors size={20} />, label: 'Serviços', id: 'services' },
        { icon: <BarChart3 size={20} />, label: 'Relatórios', id: 'reports' },
        { icon: <Store size={20} />, label: 'Marketplace', id: 'marketplace' },
        { icon: <ShoppingBag size={20} />, label: 'Compras', id: 'shopping' },
        { icon: <Gift size={20} />, label: 'Indique e Ganhe', id: 'referral' },
    ];

    return (
        <aside
            className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[#0A0A0A] border-r border-white/5 z-[60] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-72'
                }`}
        >
            {/* Header */}
            <div className={`flex items-center h-20 px-6 border-b border-white/5 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                {/* Logo Area */}
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-8' : 'w-auto'}`}>
                    <img src={logo} alt="BarberFlow" className="w-8 h-8 object-contain shrink-0" />

                    <div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        <span className="text-white font-bold tracking-tight whitespace-nowrap uppercase">
                            {'BARBERFLOW'}
                        </span>
                    </div>
                </div>

            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-3 top-24 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-zinc-200 transition-all z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id !== 'marketplace' && item.id !== 'shopping' && item.id !== 'referral') {
                                    handleNavigation(item.id);
                                }
                            }}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center relative group transition-all duration-200
                                ${isCollapsed ? 'justify-center px-0 py-3 rounded-xl' : 'px-4 py-3.5 rounded-xl gap-3'}
                                ${isActive
                                    ? 'bg-white/[0.03] text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/5'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]'
                                }
                            `}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className={`absolute left-0 top-2 bottom-2 w-1 bg-[#00FF9D] rounded-full shadow-[0_0_10px_#00FF9D] ${isCollapsed ? 'left-1' : 'left-0'}`} />
                            )}

                            {/* Icon */}
                            <span className={`transition-colors duration-200 ${isActive ? 'text-[#00FF9D]' : 'group-hover:text-zinc-300'}`}>
                                {item.icon}
                            </span>

                            {/* Label */}
                            {!isCollapsed && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm tracking-wide transition-opacity duration-300">
                                        {item.label}
                                    </span>
                                    {item.id === 'reports' && (
                                        <span className="px-1.5 py-1 bg-[#F59E0B] text-black text-[9px] font-bold rounded uppercase tracking-wider leading-none flex items-center justify-center">
                                            PRO
                                        </span>
                                    )}
                                    {(item.id === 'marketplace' || item.id === 'shopping' || item.id === 'referral') && (
                                        <span className="px-1.5 py-1 bg-zinc-800 text-zinc-400 text-[9px] font-bold rounded uppercase tracking-wider leading-none flex items-center justify-center">
                                            em breve
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className={`p-4 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <button
                    className={`flex items-center text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group
                        ${isCollapsed ? 'justify-center p-3 rounded-xl w-full' : 'w-full px-4 py-3.5 gap-3 rounded-xl'}
                    `}
                    title={isCollapsed ? "Sair" : undefined}
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
                </button>
            </div>
        </aside >
    );
};
