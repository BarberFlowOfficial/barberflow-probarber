import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    subMessage?: string;
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, subMessage, isVisible, onClose }) => {
    // Auto-close after 4 seconds if not closed
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isError = message.toLowerCase().includes('erro') || message.toLowerCase().includes('falha');

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in fade-in slide-in-from-top-5 duration-300">
            <div className={`
                flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-[400px]
                ${isError
                    ? 'bg-red-500/10 border-red-500/20 shadow-red-500/10'
                    : 'bg-[#00FF9D]/10 border-[#00FF9D]/20 shadow-[#00FF9D]/10'}
            `}>
                <div className={`mt-0.5 p-1 rounded-full ${isError ? 'bg-red-500/10 text-red-500' : 'bg-[#00FF9D]/10 text-[#00FF9D]'}`}>
                    {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                </div>

                <div className="flex-1 pt-0.5">
                    <h4 className={`font-semibold text-sm mb-1 ${isError ? 'text-white' : 'text-white'}`}>
                        {message}
                    </h4>
                    {subMessage && (
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            {subMessage}
                        </p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="group p-1 -mt-1 -mr-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <X size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
};
