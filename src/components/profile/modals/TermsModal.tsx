


export const TermsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; shop?: any }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="bg-zinc-900 p-6 rounded-lg">
                <h2 className="text-white">Termos e Condições</h2>
                <button onClick={onClose} className="mt-4 text-zinc-400">Fechar</button>
            </div>
        </div>
    );
};
