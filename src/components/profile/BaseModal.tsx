import React from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};
