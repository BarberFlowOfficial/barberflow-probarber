import React from 'react';
import { Clock, MessageCircle, Scissors } from 'lucide-react';


interface NextClientCardProps {
    upcomingAppointments: any[];
    onSelectClient: (client: any) => void;
    formatTime: (time: string) => string;
}

export const NextClientCard: React.FC<NextClientCardProps> = ({ upcomingAppointments, onSelectClient, formatTime }) => {

    const nextClients = upcomingAppointments.length > 1 ? upcomingAppointments.slice(1, 6) : [];

    // Unified Container Style (Same as DashboardNew)
    const bentoCardClass = "relative h-full rounded-[32px] bg-[#0A0A0A] border border-white/[0.05] overflow-hidden group shadow-2xl shadow-black/40 transition-all duration-500 hover:border-white/10";

    const BentoGridBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-[32px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
        </div>
    );

    return (
        <div className={`${bentoCardClass} animate-card relative`}>
            <BentoGridBackground />

            {/* NEW BADGE */}
            <div className="absolute top-0 right-0 bg-[#00FF9D] px-6 py-3 rounded-bl-3xl z-20 flex items-center justify-center">
                <span className="text-black font-black text-[10px] md:text-xs tracking-wider uppercase">EM ANDAMENTO</span>
            </div>

            <div className="p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#00FF9D]/10 rounded-xl text-[#00FF9D] border border-[#00FF9D]/20 animate-pulse">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white uppercase tracking-wide leading-none">Próximo</h3>
                            <span className="text-xs text-zinc-500 font-medium">Atendimento Prioritário</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            {upcomingAppointments[0]?.customer_name || 'Nenhum agendamento'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-zinc-400 mb-8">
                            <span className="text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-white font-medium">
                                {upcomingAppointments[0] ? formatTime(upcomingAppointments[0].appointment_time) : '--:--'}
                            </span>
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                            <span className="text-sm font-medium text-zinc-300">
                                {upcomingAppointments[0]?.services_list || '-'}
                            </span>
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                            <span className="text-sm text-zinc-500">
                                Profissional: {upcomingAppointments[0]?.barber_name || '-'}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                if (upcomingAppointments[0] && upcomingAppointments[0].status === 'confirmed') {
                                    onSelectClient({
                                        id: upcomingAppointments[0].appointment_id,
                                        name: upcomingAppointments[0].customer_name,
                                        time: formatTime(upcomingAppointments[0].appointment_time),
                                        barber: upcomingAppointments[0].barber_name,
                                        service: upcomingAppointments[0].services_list,
                                        phone: upcomingAppointments[0].client_whatsapp,
                                        fullDate: upcomingAppointments[0].appointment_time,
                                        status: upcomingAppointments[0].status
                                    });
                                }
                            }}
                            disabled={upcomingAppointments[0]?.status !== 'confirmed'}
                            className={`w-full md:w-auto px-10 py-4 rounded-2xl border transition-all font-bold text-sm flex items-center justify-center gap-2 group/btn whitespace-nowrap ${upcomingAppointments[0]?.status === 'confirmed'
                                ? 'border-[#00FF9D]/20 text-[#00FF9D] hover:bg-[#00FF9D] hover:text-black'
                                : 'border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                            {upcomingAppointments[0]?.status === 'confirmed' ? 'Confirmar Presença' : 'Finalizado'}
                        </button>
                    </div>

                    <div className="w-full md:w-auto">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Próximos da fila</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {nextClients.map((client, idx) => (
                                <div
                                    key={idx}
                                    className="group/item flex-shrink-0 cursor-pointer"
                                    onClick={() => onSelectClient({
                                        id: client.appointment_id,
                                        name: client.customer_name,
                                        time: formatTime(client.appointment_time),
                                        barber: client.barber_name,
                                        service: client.services_list,
                                        phone: client.client_whatsapp,
                                        fullDate: client.appointment_time,
                                        status: client.status
                                    })}
                                >
                                    <div className="w-24 h-32 rounded-2xl bg-[#0A0A0A] border border-white/5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:border-[#00FF9D]/30 group-hover/item:bg-[#00FF9D]/5 group-hover/item:shadow-[0_10px_20px_-10px_rgba(0,255,157,0.1)]">

                                        {/* Time Pill */}
                                        <div className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 text-[10px] font-bold text-zinc-400 group-hover/item:text-[#00FF9D] group-hover/item:border-[#00FF9D]/20 transition-colors">
                                            {formatTime(client.appointment_time)}
                                        </div>

                                        {/* Icon */}
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover/item:text-white transition-colors">
                                            <Scissors size={14} />
                                        </div>

                                        {/* Name */}
                                        <span className="text-sm font-bold text-zinc-300 group-hover/item:text-white transition-colors">
                                            {client.customer_name?.split(' ')[0] || 'Cliente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
