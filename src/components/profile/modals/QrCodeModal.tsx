import React, { useRef } from 'react';
import { BaseModal } from '../BaseModal';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Shop } from '../../../../lib/services/barberService';

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    shop: Shop | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, shop }) => {
    const [copied, setCopied] = React.useState(false);
    const qrRef = useRef<SVGSVGElement>(null);

    const baseUrl = import.meta.env.VITE_BARBERFLOW_CLIENT_URL || "https://agendar.barberflow.com/";
    const redirectUrl = shop?.redirect_url || "";
    const deepLink = `${baseUrl}/${redirectUrl}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(deepLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = () => {
        if (!qrRef.current) return;

        const svgData = new XMLSerializer().serializeToString(qrRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 512; // High resolution
            canvas.height = 512;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 32, 32, 448, 448);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `qrcode-agendamento-${shop?.name?.toLowerCase().replace(/\s+/g, '-') || 'barbearia'}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            }
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Agende seu horário na ${shop?.name}`,
                    text: `Olá! Agora você pode agendar seu horário na ${shop?.name} diretamente pelo link:`,
                    url: deepLink,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="QR Code de Agendamento"
        >
            <div className="flex flex-col items-center justify-center space-y-8 py-8">

                {/* QR CODE DISPLAY */}
                <div className="relative group">
                    <div className="w-64 h-64 bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(0,255,157,0.15)] flex items-center justify-center overflow-hidden">
                        <QRCodeSVG
                            ref={qrRef}
                            value={deepLink}
                            size={256}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: shop?.logo_url || "",
                                x: undefined,
                                y: undefined,
                                height: 48,
                                width: 48,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Download Overlay */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1E] border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-white shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                        QR Code Gerado
                    </div>
                </div>

                <div className="text-center space-y-2 max-w-xs">
                    <h3 className="text-white font-bold text-lg">Compartilhe seu Link</h3>
                    <p className="text-zinc-400 text-sm">
                        Seus clientes podem escanear este código ou acessar o link abaixo para agendar.
                    </p>
                </div>

                {/* Link Copy Field */}
                <div className="flex items-center gap-2 w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-2 pl-4">
                    <span className="text-zinc-400 text-sm truncate flex-1 select-all">{deepLink}</span>
                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-all duration-300 ${copied ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'hover:bg-white/10 text-white'}`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>

                {/* Actions Buttons */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 py-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-white font-bold text-sm hover:bg-white/5 transition-colors"
                    >
                        <Download size={18} />
                        Baixar Imagem
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 py-3 bg-[#00FF9D] text-black rounded-xl font-bold text-sm hover:bg-[#00E68A] transition-colors"
                    >
                        <Share2 size={18} />
                        Compartilhar
                    </button>
                </div>

            </div>
        </BaseModal>
    );
};
