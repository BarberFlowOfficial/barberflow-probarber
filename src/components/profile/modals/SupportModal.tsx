import React from 'react';
import { HelpCircle, MessageCircle, AlertTriangle, ExternalLink, Mail, X } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen) return null;

    const renderOption = (icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-[#1C1C1E] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group text-left"
        >
            <div className="flex items-center gap-4">
                <div className="text-zinc-400 group-hover:text-white transition-colors">
                    {icon}
                </div>
                <div>
                    <h4 className="text-white font-semibold text-[15px]">{title}</h4>
                    <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{subtitle}</p>
                </div>
            </div>
            <ExternalLink size={18} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            ></div>

            {/* Container */}
            <div className="relative w-full max-w-[420px] bg-[#09090B] border border-white/10 rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                    <h2 className="text-lg font-bold text-white">Ajuda e Suporte</h2>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full -mr-2"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    {renderOption(
                        <HelpCircle size={22} />,
                        'Central de Ajuda',
                        'Tutoriais, guias e perguntas frequentes.'
                    )}

                    {renderOption(
                        <MessageCircle size={22} />,
                        'Falar com Suporte (WhatsApp)',
                        'Atendimento em tempo real.',
                        () => window.open('https://wa.me/5511999999999', '_blank')
                    )}

                    {renderOption(
                        <Mail size={22} />,
                        'Enviar Email',
                        'Para questões mais complexas ou anexo de arquivos.',
                        () => window.open('mailto:suporte@barberflow.com')
                    )}

                    {renderOption(
                        <AlertTriangle size={22} />,
                        'Reportar um Problema',
                        'Encontrou um bug? Nos avise.'
                    )}

                    {/* Community Banner */}
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#00FF9D]/[0.03] to-[#00FF9D]/[0.08] border border-[#00FF9D]/10 text-center space-y-3">
                        <h3 className="text-[#00FF9D] font-bold text-sm">Comunidade BarberFlow</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed max-w-[280px] mx-auto">
                            Junte-se ao nosso grupo exclusivo no Discord para trocar experiências com outros donos de barbearia.
                        </p>
                        <button className="text-white text-xs font-bold underline decoration-[#00FF9D] decoration-2 underline-offset-4 hover:text-[#00FF9D] transition-colors">
                            Entrar na Comunidade
                        </button>
                    </div>

                    {/* Footer User ID */}
                    <div className="pt-2 text-center">
                        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
                            ID do Usuário: {user?.id?.slice(0, 8) || 'bf_12345678'}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};
