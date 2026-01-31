import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Camera,
    User,
    Mail,
    Phone,
    FileText,
    Lock,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { ShopAvatar } from '../../../../components/ShopAvatar';
import { useAuth } from '../../../../contexts/AuthContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Password Section State
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password Visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (isOpen && user) {
            setName(user.user_metadata?.name || '');
            setEmail(user.email || '');
            // Mock data for fields that might not be in auth metadata yet or need specific structure
            setPhone(user.user_metadata?.phone || '');
            setAvatarPreview(user.user_metadata?.avatar_url || null);
        }
    }, [isOpen, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Logic to save profile
        console.log({
            name,
            email,
            phone,
            cpf,
            avatar: avatarPreview,
            password: showPasswordSection ? { currentPassword, newPassword } : null
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-[500px] bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <ShopAvatar
                                name={name}
                                imageUrl={avatarPreview}
                                size="custom"
                                customSize="100px"
                                className="border-4 border-[#1C1C1E] group-hover:border-[#00FF9D]/50 transition-colors"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#00FF9D] text-black p-2 rounded-full border-[3px] border-[#0D0D0D]">
                                <Camera size={14} />
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-zinc-400 group-hover:text-[#00FF9D] cursor-pointer transition-colors" onClick={() => fileInputRef.current?.click()}>
                            Alterar foto de perfil
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Personal Data Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400 font-medium ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400 font-medium ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400 font-medium ml-1">Telefone / Celular</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400 font-medium ml-1">CPF</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="pt-4 border-t border-white/10">
                        <button
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="w-full flex items-center justify-between p-4 bg-[#1C1C1E]/50 border border-white/5 rounded-xl hover:bg-[#1C1C1E] transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#00FF9D]/10 rounded-lg text-[#00FF9D]">
                                    <Lock size={18} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-medium group-hover:text-[#00FF9D] transition-colors">Segurança e Senha</h3>
                                    <p className="text-xs text-zinc-500">Alterar sua senha de acesso</p>
                                </div>
                            </div>
                            {showPasswordSection ? (
                                <ChevronUp size={20} className="text-zinc-500" />
                            ) : (
                                <ChevronDown size={20} className="text-zinc-500" />
                            )}
                        </button>

                        {showPasswordSection && (
                            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 font-medium ml-1">Senha Atual</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                            placeholder="Digite sua senha atual"
                                        />
                                        <button
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 font-medium ml-1">Nova Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                            placeholder="Digite a nova senha"
                                        />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 font-medium ml-1">Confirmar Nova Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-[#00FF9D]/50 focus:ring-1 focus:ring-[#00FF9D]/50 transition-all placeholder:text-zinc-600"
                                            placeholder="Confirme a nova senha"
                                        />
                                        <button
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0D0D0D] rounded-b-2xl">
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#00FF9D] text-black font-bold py-4 rounded-xl hover:bg-[#00FF9D]/90 active:scale-[0.98] transition-all"
                    >
                        Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
};
