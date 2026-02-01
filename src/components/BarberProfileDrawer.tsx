
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    LogOut,
    X,
    Link2,
    Check,
    ChevronRight,
    Landmark,
    QrCode,
    FileText,
    User,
    HelpCircle
} from 'lucide-react';
import { Shop } from '../../lib/services/barberService';
import { ShopAvatar } from '../../components/ShopAvatar';
import { EditProfileModal } from './profile/modals/EditProfileModal';
import { BankingDataModal } from './profile/modals/BankingDataModal';
import { QrCodeModal } from './profile/modals/QrCodeModal';
import { TermsModal } from './profile/modals/TermsModal';
import { SupportModal } from './profile/modals/SupportModal';

interface BarberProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => void;
    shop: Shop | null;
    isSidebarCollapsed?: boolean;
}

export const BarberProfileDrawer: React.FC<BarberProfileDrawerProps> = ({
    isOpen,
    onClose,
    shop,
    isSidebarCollapsed = false
    // onNavigate
}) => {
    const { user, signOut } = useAuth();
    const [copied, setCopied] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isBankingDataOpen, setIsBankingDataOpen] = useState(false);
    const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const link = "https://barbearialinkteste.com/"; // TODO: replace with dynamic link if available

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

    const handleLogout = async () => {
        await signOut();
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] md:z-[50] flex justify-end md:justify-center md:items-center transition-all duration-300
                ${isSidebarCollapsed ? 'md:left-[72px]' : 'md:left-72'}
                top-0 bottom-0 right-0
            `}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Drawer (Mobile) / Modal (Desktop) - NOW FULL SCREEN CONTENT */}
            <div className="relative w-full h-full bg-[#0D0D0D] p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right md:animate-in md:zoom-in-95 duration-300 flex flex-col pb-safe scrollbar-hide">

                <div className="w-full max-w-[400px] mx-auto h-full flex flex-col">
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
                                    name={user?.user_metadata?.name || 'Barbeiro'}
                                    imageUrl={user?.user_metadata?.avatar_url || null}
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

                        {/* 3. Items List */}
                        <div className="flex flex-col border-t border-white/[0.08] mt-8">

                            {/* Meu Perfil */}
                            <button
                                onClick={() => {
                                    setIsEditProfileOpen(true);
                                    // Don't close drawer if we want modal on top, 
                                    // BUT usually drawers might overlap or close. 
                                    // Since modal is fixed inset-0 z-110, it will show over drawer (z-100).
                                    // Let's keep drawer open or close it? 
                                    // If we close drawer, going back from modal might be weird.
                                    // Let's keep drawer open for now.
                                }}
                                className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <User size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">Meu perfil</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* Dados Bancários */}
                            <button
                                onClick={() => {
                                    setIsBankingDataOpen(true);
                                }}
                                className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
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
                                onClick={() => {
                                    setIsQrCodeOpen(true);
                                }}
                                className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <QrCode size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">QR Code de Agendamento</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* Ajuda e Suporte */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // CRÍTICO: Impede que o Drawer feche ao clicar
                                    setIsSupportModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        <HelpCircle size={20} />
                                    </span>
                                    <span className="text-[16px] text-white font-normal">Ajuda e Suporte</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </button>

                            {/* Termos e Privacidade */}
                            <button
                                onClick={() => {
                                    setIsTermsOpen(true);
                                }}
                                className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
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
                            className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group rounded-xl px-2 -mx-2 mb-safe-bottom"
                        >
                            <span className="text-[#FF6B6B] group-hover:text-red-400 transition-colors"><LogOut size={20} /></span>
                            <span className="text-[16px] text-[#FF6B6B] font-medium group-hover:text-red-400 transition-colors">Sair da conta</span>
                        </button>

                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
            <BankingDataModal
                isOpen={isBankingDataOpen}
                onClose={() => setIsBankingDataOpen(false)}
            />
            <QrCodeModal
                isOpen={isQrCodeOpen}
                onClose={() => setIsQrCodeOpen(false)}
                shop={shop}
            />
            <TermsModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
                shop={shop}
            />
            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
            />
        </div>
    );
};
