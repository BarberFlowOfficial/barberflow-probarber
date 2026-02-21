import React, { useState, useEffect } from 'react';
import { BaseModal } from '../src/components/profile/BaseModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, Wallet, Key } from 'lucide-react';

interface WalletData {
    balance: number;
    reserved_balance: number;
}

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    shopId: string;
    userId: string;
    walletData: WalletData;
    onSuccess: () => void;
}

type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
    isOpen,
    onClose,
    shopId,
    userId,
    walletData,
    onSuccess
}) => {
    const getUrlUserId = () => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            try {
                const params = new URLSearchParams(hash.substring(1));
                const token = params.get('access_token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.sub;
                }
            } catch (e) { }
        }
        return null;
    };

    const [amount, setAmount] = useState<number>(0);
    const [maskedAmount, setMaskedAmount] = useState<string>('');
    const [pixKeyType, setPixKeyType] = useState<PixKeyType>('CPF');
    const [pixKey, setPixKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);
    const [amountError, setAmountError] = useState<string | null>(null);

    const { user } = useAuth();

    // Auto-dismiss feedback message
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => {
                setFeedback(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        const numericValue = Number(rawValue) / 100;

        setAmount(numericValue);
        setMaskedAmount(formatCurrency(numericValue));

        if (numericValue > walletData.balance) {
            setAmountError('Valor superior ao saldo disponível');
        } else {
            setAmountError(null);
        }
    };

    const handleWithdraw = async () => {
        if (amount <= 0) {
            setFeedback({
                type: 'error',
                title: 'Valor Inválido',
                message: 'Por favor, insira um valor de saque válido.'
            });
            return;
        }

        if (amount > walletData.balance) {
            setFeedback({
                type: 'error',
                title: 'Saldo Insuficiente',
                message: 'O valor do saque não pode ser superior ao saldo disponível.'
            });
            return;
        }

        if (!pixKey.trim()) {
            setFeedback({
                type: 'error',
                title: 'Chave PIX Ausente',
                message: 'Por favor, insira a chave PIX para o saque.'
            });
            return;
        }

        // Garante que pegamos o ID da fonte correta (mesma do Dashboard)
        const currentUserId = user?.id || userId || getUrlUserId();

        console.log("📤 Enviando pedido de saque:", {
            shopId,
            amount: amount,
            userId: currentUserId,
            pixKey,
            pixKeyType
        });

        if (!currentUserId || currentUserId === '') {
            setFeedback({
                type: 'error',
                title: 'Usuário não identificado',
                message: 'Erro: Usuário não identificado. Tente atualizar a página.'
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.functions.invoke('process-pix-withdrawal', {
                body: {
                    shopId,
                    userId: currentUserId,
                    amount: amount,
                    pixKey,
                    pixKeyType
                }
            });

            if (error) throw error;

            setFeedback({
                type: 'success',
                title: 'Saque solicitado!',
                message: 'Sua solicitação de saque foi enviada com sucesso.'
            });

            onSuccess();

            // Wait 2 seconds and close the modal
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Error processing PIX withdrawal:', error);
            setFeedback({
                type: 'error',
                title: 'Erro no Saque',
                message: error.message || 'Não foi possível processar o saque agora. Tente novamente mais tarde.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Solicitar Saque via PIX"
        >
            {/* Feedback Banner (Pattern from BusinessHoursModal) */}
            {feedback && (
                <div
                    className="fixed top-24 right-4 md:right-8 z-[9999]"
                    style={{ animation: 'slideInRight 0.5s ease-out forwards' }}
                >
                    <div className={`bg-[#1C1C1E] border border-white/5 border-l-4 ${feedback.type === 'success' ? 'border-l-[#00FF9D]' : 'border-l-red-500'
                        } rounded-xl pl-5 pr-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-start gap-4 min-w-[280px] max-w-[calc(100vw-32px)] md:max-w-md transition-all`}>
                        <div className={`mt-0.5 ${feedback.type === 'success' ? 'text-[#00FF9D]' : 'text-red-500'
                            }`}>
                            {feedback.type === 'success' ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <AlertCircle size={22} strokeWidth={2.5} />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h4 className="text-white font-bold text-[14px] leading-tight">{feedback.title}</h4>
                            <p className={`text-[13px] font-medium leading-tight ${feedback.type === 'success' ? 'text-[#00FF9D]' : 'text-red-500/90'
                                }`}>
                                {feedback.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Available Balance Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={64} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest relative z-10">Saldo Disponível</span>
                    <h2 className="text-3xl font-black text-white relative z-10">{formatCurrency(walletData.balance)}</h2>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Valor do Saque</label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={maskedAmount}
                            onChange={handleAmountChange}
                            placeholder="R$ 0,00"
                            className={`w-full bg-white/[0.03] border rounded-2xl py-4 pl-4 pr-4 text-white font-bold text-lg focus:outline-none transition-colors ${amountError ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#00FF9D]/30'
                                }`}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 pl-1">
                        {amountError && (
                            <span className="text-xs font-medium text-red-500 animate-pulse">
                                {amountError}
                            </span>
                        )}
                        <p className="text-[11px] text-zinc-500 font-medium leading-tight">
                            Atenção: É cobrada uma taxa de 2,99% + R$ 0,50 por operação pela plataforma de processamento.
                        </p>
                    </div>
                </div>

                {/* PIX Key Type Select */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tipo de Chave</label>
                    <select
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white font-medium focus:outline-none focus:border-[#00FF9D]/30 transition-colors appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                    >
                        <option value="CPF" className="bg-[#121212]">CPF</option>
                        <option value="CNPJ" className="bg-[#121212]">CNPJ</option>
                        <option value="EMAIL" className="bg-[#121212]">E-mail</option>
                        <option value="PHONE" className="bg-[#121212]">Telefone</option>
                        <option value="EVP" className="bg-[#121212]">Chave Aleatória (EVP)</option>
                    </select>
                </div>

                {/* PIX Key Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Chave PIX</label>
                    <div className="relative">
                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
                            placeholder="Insira sua chave aqui"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-[#00FF9D]/30 transition-colors"
                        />
                    </div>
                </div>

                <p className="text-xs text-zinc-500 text-center px-4 leading-relaxed">
                    O valor será transferido para a conta vinculada à chave PIX informada. Certifique-se de que os dados estão corretos.
                </p>

                <button
                    onClick={handleWithdraw}
                    disabled={isLoading || amount <= 0 || !!amountError}
                    className={`w-full py-4 font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 ${!!amountError ? 'bg-red-500/20 text-red-500' : 'bg-[#00FF9D] text-black hover:bg-[#00CC7D]'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <ArrowRight size={20} />
                            Solicitar Saque
                        </>
                    )}
                </button>
            </div>
        </BaseModal>
    );
};

