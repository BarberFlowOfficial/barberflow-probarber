import React, { useState, useEffect } from 'react';
import { X, Landmark, ChevronDown, Building2, User } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface BankingDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BankingDataModal: React.FC<BankingDataModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    // PIX State
    const [pixType, setPixType] = useState('cpf');
    const [pixKey, setPixKey] = useState('');

    // Bank Account State
    const [selectedBank, setSelectedBank] = useState('');
    const [accountType, setAccountType] = useState('checking');
    const [agency, setAgency] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [holderName, setHolderName] = useState('');
    const [holderDoc, setHolderDoc] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);

    // Initial Data Mock
    useEffect(() => {
        if (isOpen && user) {
            // Mock initial data if available or leave empty
            setHolderName(user.user_metadata?.name || '');
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log({
            pix: { type: pixType, key: pixKey },
            bank: {
                bank: selectedBank,
                type: accountType,
                agency,
                account: accountNumber,
                holder: holderName,
                doc: holderDoc
            }
        });
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-[600px] bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Dados Bancários</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">

                    {/* PIX Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-[#00FF9D]/10 text-[#00FF9D] px-2 py-1 rounded text-xs font-bold tracking-wider">PIX</div>
                            <h3 className="text-white font-bold text-sm tracking-wide">CHAVE PIX</h3>
                        </div>

                        <div className="p-5 rounded-xl border border-white/10 bg-[#1C1C1E] space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Tipo de Chave</label>
                                    <div className="relative">
                                        <select
                                            value={pixType}
                                            onChange={(e) => setPixType(e.target.value)}
                                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#00FF9D] appearance-none cursor-pointer"
                                        >
                                            <option value="cpf">CPF</option>
                                            <option value="cnpj">CNPJ</option>
                                            <option value="email">E-mail</option>
                                            <option value="phone">Celular</option>
                                            <option value="random">Aleatória</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Chave</label>
                                    <input
                                        type="text"
                                        value={pixKey}
                                        onChange={(e) => setPixKey(e.target.value)}
                                        className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#00FF9D] placeholder:text-zinc-700"
                                        placeholder={pixType === 'email' ? 'exemplo@pix.com' : 'Informe sua chave'}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Esta chave será utilizada como método preferencial para receber pagamentos via PIX e transferências do saldo da barbearia.
                            </p>
                        </div>
                    </div>

                    {/* Bank Account Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold tracking-wider">BANCO</div>
                            <h3 className="text-white font-bold text-sm tracking-wide">CONTA BANCÁRIA</h3>
                        </div>

                        <div className="p-5 rounded-xl border border-white/10 bg-[#1C1C1E] space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Instituição Bancária</label>
                                    <div className="relative">
                                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <select
                                            value={selectedBank}
                                            onChange={(e) => setSelectedBank(e.target.value)}
                                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#00FF9D] appearance-none cursor-pointer"
                                        >
                                            <option value="">Selecione o banco</option>
                                            <option value="001">Banco do Brasil</option>
                                            <option value="237">Bradesco</option>
                                            <option value="341">Itaú</option>
                                            <option value="260">Nu Pagamentos (Nubank)</option>
                                            <option value="077">Banco Inter</option>
                                            <option value="104">Caixa Econômica</option>
                                            {/* Add more banks as needed */}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Tipo de Conta</label>
                                    <div className="relative">
                                        <select
                                            value={accountType}
                                            onChange={(e) => setAccountType(e.target.value)}
                                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#00FF9D] appearance-none cursor-pointer"
                                        >
                                            <option value="checking">Conta Corrente</option>
                                            <option value="savings">Conta Poupança</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Agência</label>
                                    <input
                                        type="text"
                                        value={agency}
                                        onChange={(e) => setAgency(e.target.value)}
                                        className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]"
                                        placeholder="0000"
                                    />
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Número da Conta (com dígito)</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]"
                                        placeholder="0000000-0"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-white/5 my-4"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">Nome do Titular</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <input
                                            type="text"
                                            value={holderName}
                                            onChange={(e) => setHolderName(e.target.value)}
                                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]"
                                            placeholder="Nome completo igual no banco"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs text-zinc-400 font-bold uppercase">CPF/CNPJ do Titular</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <input
                                            type="text"
                                            value={holderDoc}
                                            onChange={(e) => setHolderDoc(e.target.value)}
                                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]"
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0D0D0D] rounded-b-2xl flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-zinc-300 font-medium hover:bg-white/5 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-[#00FF9D] text-black font-bold hover:bg-[#00FF9D]/90 active:scale-[0.98] transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                Salvando...
                            </>
                        ) : (
                            'Salvar Alterações'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
