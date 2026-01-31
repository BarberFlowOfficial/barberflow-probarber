
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
import { ShopAvatar } from '../../components/ShopAvatar';

interface BarberProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: 'dashboard' | 'barber-dashboard' | 'schedule' | 'finance' | 'services' | 'reports' | 'profile') => void;
}

export const BarberProfileDrawer: React.FC<BarberProfileDrawerProps> = ({
    isOpen,
    onClose,

    onNavigate
}) => {
    const { user, signOut } = useAuth();
    const [copied, setCopied] = useState(false);
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
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full md:w-[400px] h-full bg-[#0D0D0D] p-6 border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col pb-safe">

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
                                onNavigate('profile');
                                onClose();
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
                                // TODO: Logic for opening Banking Data modal or navigation
                                // For now just close or do nothing specific as per instruction "Map out items"
                                onClose();
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
                                // TODO: Logic for QR Code
                                onClose();
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
                            onClick={() => {
                                onClose();
                            }}
                            className="w-full flex items-center justify-between py-4 border-b border-white/[0.08] hover:bg-white/[0.03] active:bg-white/[0.05] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-400 group-hover:text-white transition-colors">
                                    <HelpCircle size={20} />
                                </span>
                                <span className="text-[16px] text-white font-normal">Ajuda e suporte</span>
                            </div>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </button>

                        {/* Termos e Privacidade */}
                        <button
                            onClick={() => {
                                // TODO: Logic for Terms
                                onClose();
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
    );
};
