import React, { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { Check, Loader2 } from 'lucide-react';
import { acceptTerms, Shop } from '@lib/services/barberService';
import { Toast } from '@/components/Toast';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shop?: Shop | null;
    onUpdate?: (updatedShop: Shop) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, shop, onUpdate }) => {
    const [accepted, setAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', subMessage: '' });

    const isAlreadyAccepted = shop?.terms_accepted === true;

    useEffect(() => {
        if (isAlreadyAccepted) {
            setAccepted(true);
        } else {
            setAccepted(false);
        }
    }, [isAlreadyAccepted, isOpen]);

    const handleConfirm = async () => {
        if (isAlreadyAccepted) {
            onClose();
            return;
        }

        if (!shop?.id) return;

        setIsLoading(true);
        try {
            const result = await acceptTerms(shop.id);
            if (result && result.length > 0) {
                if (onUpdate) onUpdate(result[0]);
                setToast({
                    visible: true,
                    message: 'Sucesso!',
                    subMessage: 'Termos aceitos com sucesso.'
                });
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to accept terms:', error);
            setToast({
                visible: true,
                message: 'Erro',
                subMessage: 'Não foi possível salvar seu consentimento.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Termos de Uso"
        >
            <div className="flex flex-col h-full max-h-[70vh]">
                {/* Scrollable Terms Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-zinc-400 text-sm leading-relaxed custom-scrollbar bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-white font-bold text-base">Termos e Condições de Uso</h3>
                    <p>
                        Seja bem-vindo ao Barberflow Pro. Ao utilizar nossa plataforma, você concorda com os seguintes termos:
                    </p>
                    <p className="font-bold text-zinc-300">1. Uso do Sistema</p>
                    <p>
                        O Barberflow Pro é uma ferramenta de gestão para barbearias. O uso adequado do sistema é de responsabilidade do gestor, garantindo a veracidade das informações inseridas.
                    </p>
                    <p className="font-bold text-zinc-300">2. Privacidade e Dados</p>
                    <p>
                        Protegemos seus dados e os dados de seus clientes de acordo com a LGPD. Suas informações financeiras e de equipe são criptografadas e utilizadas apenas para o funcionamento das ferramentas de relatório e agenda.
                    </p>
                    <p className="font-bold text-zinc-300">3. Assinatura e Cobrança</p>
                    <p>
                        Os planos são recorrentes. O não pagamento pode resultar na suspensão temporária do acesso às ferramentas premium.
                    </p>
                    <p className="font-bold text-zinc-300">4. Responsabilidades</p>
                    <p>
                        Não nos responsabilizamos por mal uso do sistema ou falhas de hardware/conexão por parte do usuário. Comprometa-se a manter sua senha de acesso segura.
                    </p>
                    <p>
                        [O texto completo dos termos seria inserido aqui conforme fornecido pelo jurídico].
                    </p>
                </div>

                {/* Consent Section */}
                <div className="pt-6 space-y-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-white/5 checked:bg-[#00FF9D] checked:border-[#00FF9D] transition-all cursor-pointer disabled:opacity-50"
                                checked={accepted}
                                onChange={(e) => !isAlreadyAccepted && setAccepted(e.target.checked)}
                                disabled={isAlreadyAccepted || isLoading}
                            />
                            <Check
                                size={14}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            />
                        </div>
                        <span className={`text-sm select-none transition-colors ${accepted ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                            Li e concordo com os Termos de Uso e Política de Privacidade
                        </span>
                    </label>

                    <button
                        onClick={handleConfirm}
                        disabled={!accepted || isLoading}
                        className={`
                            w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                            ${accepted
                                ? 'bg-[#00FF9D] text-black hover:bg-[#00E68A] shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                                : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'}
                            ${isLoading ? 'opacity-70' : ''}
                        `}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : isAlreadyAccepted ? (
                            'Fechar'
                        ) : (
                            'Enviar / Confirmar'
                        )}
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                subMessage={toast.subMessage}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />
        </BaseModal>
    );
};
