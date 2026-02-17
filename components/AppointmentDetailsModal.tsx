import React from 'react';
import { User, X, Clock, Scissors, MessageCircle } from 'lucide-react';

import { updateAppointmentStatus } from '../lib/services/barberService';
import { format, isToday, isTomorrow } from 'date-fns';

interface AppointmentDetailsModalProps {
    client: any;
    onClose: () => void;
    onConfirm: (client: any) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ client, onClose, onConfirm }) => {
    if (!client) return null;

    const handleConfirmPresence = async (selectedClient: any) => {
        // Log para depuração da estrutura do objeto
        console.log("Estrutura do agendamento:", JSON.stringify(selectedClient, null, 2));

        // 1. Prepare WhatsApp URL & Open immediately (to avoid popup blockers)
        // Busca exaustiva pelo telefone
        const rawPhone =
            selectedClient.phone ||
            selectedClient.client_whatsapp ||
            selectedClient.whatsapp ||
            selectedClient.whatsapp_contact ||
            selectedClient.client?.phone ||
            selectedClient.client?.whatsapp_contact ||
            selectedClient.telephone ||
            '';

        const phone = rawPhone.replace(/\D/g, '');

        const appDate = new Date(selectedClient.fullDate);
        let dateText = '';
        try {
            if (isToday(appDate)) dateText = 'Hoje';
            else if (isTomorrow(appDate)) dateText = 'Amanhã';
            else dateText = format(appDate, 'dd/MM');
        } catch (e) {
            console.error('Date error:', e);
            dateText = 'Data inválida';
        }

        const message = `Olá ${selectedClient.name}, tudo certo para nosso agendamento de ${dateText} às ${selectedClient.time}?`;
        const encodedMessage = encodeURIComponent(message);

        if (phone) {
            const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        } else {
            console.warn('Telefone não encontrado para o cliente:', selectedClient.name);
            alert('Não foi possível encontrar o telefone deste cliente. Verifique o cadastro.');
        }

        // 2. Perform Async Updates
        try {
            // Sempre executa o update, a menos que seja canceled (garantido pelo botão disabled, mas bom ter check extra se quiser)
            if (selectedClient.status !== 'canceled') {
                await updateAppointmentStatus(selectedClient.id, 'confirmed');
            }

            // Call the callback to refresh parent data if needed
            if (onConfirm) onConfirm(selectedClient);

            // Clean state (close modal)
            onClose();

        } catch (error) {
            console.error('Failed to confirm presence:', error);
        }
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ perspective: '1000px' }}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[#09090B] rounded-[32px] p-6 shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#16271e] flex items-center justify-center border border-[#00FF9D]/20">
                            <User className="text-[#00FF9D]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">Detalhes</h3>
                            <span className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">Informações do Cliente</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Client Name */}
                <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">{client.name}</h2>

                {/* Time & Service */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#18181B] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                        <Clock size={16} className="text-[#00FF9D]" />
                        <span className="text-white font-bold text-sm">{client.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Scissors size={16} />
                        <span className="font-medium text-sm">
                            {Array.isArray(client.service)
                                ? client.service.map((s: any) => s.name || s).join(', ')
                                : (client.service?.name || client.service || 'Serviços')}
                        </span>
                    </div>
                </div>

                {/* Professional Card */}
                <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <User size={24} className="text-zinc-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Profissional Responsável</span>
                        <span className="text-white font-bold text-lg">{client.barber || 'Profissional'}</span>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={() => handleConfirmPresence(client)}
                    disabled={client.status === 'canceled'}
                    className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${client.status !== 'canceled'
                        ? 'bg-[#00FF9D] hover:bg-[#00CC7D] text-black'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                        }`}
                >
                    <MessageCircle size={20} />
                    {client.status === 'confirmed' ? 'Reenviar Confirmação' : 'Confirmar Presença'}
                </button>

            </div>
        </div>
    );
};
