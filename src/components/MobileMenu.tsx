
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutGrid,
    Calendar,
    Wallet,
    Scissors,
    BarChart3,
    Store,
    ShoppingBag,
    Gift,
    Settings,
    LogOut,
    X,
    Link2,
    Check,
    ChevronRight,

    Landmark,
    QrCode,
    FileText,
    User,

} from 'lucide-react';

import { Shop } from '../../lib/services/barberService';
import { ShopAvatar } from '../../components/ShopAvatar';
import { EditProfileModal } from './profile/modals/EditProfileModal';
import { BankingDataModal } from './profile/modals/BankingDataModal';
import { QrCodeModal } from '@/components/profile/modals/QrCodeModal';
import { TermsModal } from './profile/modals/TermsModal';


interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: string;
    onNavigate: (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => void;
    shop: Shop | null;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    currentView,
    onNavigate,
    shop
}) => {
    const [copied, setCopied] = useState(false);
    const link = "https://barbearialinkteste.com/";

    // Modal States for Barber Dashboard
    const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);
    const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);



    // Handle back button on Android
    useEffect(() => {
        const handleBackButton = (e: PopStateEvent) => {
            if (isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        if (isOpen) {
            window.history.pushState({ mobileMenu: true }, '');
            window.addEventListener('popstate', handleBackButton);
        }

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [isOpen, onClose]);

    // Handle Copy Link
    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'barber-dashboard', icon: LayoutGrid, label: 'Painel Barbeiro' },
        { id: 'schedule', icon: Calendar, label: 'Agendamentos' },
        { id: 'finance', icon: Wallet, label: 'Finanças' },
        { id: 'services', icon: Scissors, label: 'Serviços' },
        { id: 'reports', icon: BarChart3, label: 'Relatórios', badge: 'PRO', badgeColor: 'bg-[#00FF9D] text-black' },
        { id: 'marketplace', icon: Store, label: 'Marketplace', badge: 'EM BREVE', disabled: true },
        { id: 'shopping', icon: ShoppingBag, label: 'Compras', badge: 'EM BREVE', disabled: true },
        { id: 'referral', icon: Gift, label: 'Indique e Ganhe', badge: 'EM BREVE', disabled: true },
    ];

    // Specific Menu for Barber Dashboard
    if (currentView === 'barber-dashboard') {
        const { user } = useAuth();
        const handleLogout = () => {
            // Mock logout
            window.location.reload();
        };

        return (
            <div className="fixed inset-0 z-[100] flex justify-end">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                {/* Drawer */}

                <div className="relative w-full md:w-[400px] h-full bg-[#0D0D0D] p-6 border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col pb-safe">

                    {/* MODALS */}
                    <EditProfileModal
                        isOpen={isEditProfileModalOpen}
                        onClose={() => setIsEditProfileModalOpen(false)}
                    />
                    <BankingDataModal
                        isOpen={isBankingModalOpen}
                        onClose={() => setIsBankingModalOpen(false)}
                    />
                    <QrCodeModal
                        isOpen={isQrCodeModalOpen}
                        onClose={() => setIsQrCodeModalOpen(false)}
                        shop={shop}
                    />
                    <TermsModal
                        isOpen={isTermsModalOpen}
                        onClose={() => setIsTermsModalOpen(false)}
                        shop={shop}
                    />



                    {/* Header */}
                    <div className="flex items-center justify-end mb-6">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-8">

                        {/* 1. Profile Picture */}
                        <div className="flex flex-col items-center pt-2">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 rounded-full bg-[#00FF9D] blur-md opacity-20"></div>
                                <ShopAvatar
                                    name={user?.user_metadata?.name || shop?.name}
                                    imageUrl={user?.user_metadata?.avatar_url || shop?.logo_url}
                                    size="custom"
                                    customSize="110px"
                                    className="border-[3px] border-[#00FF9D] p-1 relative z-10"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {user?.user_metadata?.name || 'Barbeiro'}
                            </h2>

                            {/* 2. Copy Link */}
                            <div className="w-full flex justify-center">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] rounded-xl border border-white/5 active:scale-95 transition-all w-full max-w-[280px] justify-center group"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={18} className="text-[#00FF9D]" />
                                            <span className="text-[#00FF9D] text-sm font-bold">Link copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Link2 size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                                            <span className="text-zinc-200 text-sm font-bold group-hover:text-white transition-colors">Copiar link da agenda</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 3. Items List (Copied Design from OptionList) */}
                        <div className="flex flex-col mt-8">

                            {/* Meu Perfil */}
                            <button
                                onClick={() => setIsEditProfileModalOpen(true)}
                                className="w-full flex items-center justify-between py-4 bg-[#0d0d0d] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <User size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">Meu Perfil</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* Dados Bancários */}
                            <button
                                onClick={() => setIsBankingModalOpen(true)}
                                className="w-full flex items-center justify-between py-4 bg-[#0d0d0d] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <Landmark size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">Dados Bancários</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* QR Code */}
                            <button
                                onClick={() => setIsQrCodeModalOpen(true)}
                                className="w-full flex items-center justify-between py-4 bg-[#0d0d0d] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <QrCode size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">QR Code de Agendamento</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* Termos e Privacidade */}
                            <button
                                onClick={() => setIsTermsModalOpen(true)}
                                className="w-full flex items-center justify-between py-4 bg-[#0d0d0d] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">Termos e Privacidade</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>



                        </div>


                        <div className="flex-1"></div>

                        {/* 6. Sair da conta */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 py-4 bg-[#0d0d0d] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group rounded-xl px-2 -mx-2 mb-safe-bottom"
                        >
                            <span className="text-[#FF6B6B] group-hover:text-red-400 transition-colors"><LogOut size={20} /></span>
                            <span className="text-[16px] text-[#FF6B6B] font-medium group-hover:text-red-400 transition-colors">Sair da conta</span>
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] md:hidden bg-[#0D0D0D] overflow-y-auto animate-in slide-in-from-bottom duration-300 flex flex-col pb-safe">

            {/* Header */}
            <div className="flex items-center justify-end px-6 pt-safe-top min-h-[80px]">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 px-6 pb-8 space-y-8">

                {/* Profile Section */}
                <div className="flex flex-col items-center pt-4">
                    <ShopAvatar
                        name={shop?.name}
                        imageUrl={shop?.logo_url}
                        size="custom"
                        customSize="100px"
                        className="border-[3px] border-[#00FF9D] p-1 mb-4"
                    />

                    <h2 className="text-xl font-bold text-white mb-4">{shop?.name || 'Barbearia Naregua'}</h2>

                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-full border border-white/10 active:scale-95 transition-all w-full max-w-[240px] justify-center"
                    >
                        {copied ? (
                            <>
                                <Check size={16} className="text-[#00FF9D]" />
                                <span className="text-[#00FF9D] text-sm font-bold">Link copiado!</span>
                            </>
                        ) : (
                            <>
                                <Link2 size={16} className="text-zinc-400" />
                                <span className="text-white text-sm font-medium">Copiar link da agenda</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Settings Link */}
                <button
                    onClick={() => onNavigate('profile')}
                    className="w-full flex items-center justify-between p-4 bg-[#1C1C1E] rounded-2xl border border-white/5 active:bg-[#252528] transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                            <Settings size={20} />
                        </div>
                        <span className="text-white font-medium">Configurações</span>
                    </div>
                    <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                </button>

                {/* Navigation Items */}
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => {
                                if (!item.disabled) {
                                    onNavigate(item.id as any);
                                    onClose();
                                }
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-white/5'
                                } ${currentView === item.id && !item.disabled ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-zinc-400'}`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon size={22} className={currentView === item.id && !item.disabled ? 'text-[#00FF9D]' : 'text-zinc-500'} />
                                <span className={`font-medium ${currentView === item.id && !item.disabled ? 'text-white' : 'text-white'}`}>
                                    {item.label}
                                </span>
                            </div>

                            {item.badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.badgeColor || 'bg-white/10 text-zinc-400'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <button className="w-full flex items-center gap-4 p-4 text-zinc-500 hover:text-red-500 transition-colors">
                    <LogOut size={22} />
                    <span className="font-medium">Sair da conta</span>
                </button>

            </div>
        </div>
    );
};
