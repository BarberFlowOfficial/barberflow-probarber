import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // We could log error to an error reporting service here
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-8 h-8 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">
                            Algo deu errado
                        </h1>

                        <p className="text-zinc-400 mb-6 text-sm">
                            Identificamos um problema inesperado. Tente recarregar a página ou voltar para o login.
                        </p>

                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-6 text-left overflow-auto max-h-32">
                            <p className="text-red-400 text-xs font-mono break-all">
                                {this.state.error?.message || 'Erro desconhecido'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-[#00FF9D] hover:bg-[#00FF9D]/90 text-black font-bold py-3 rounded-xl transition-all"
                            >
                                Recarregar Página
                            </button>

                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }}
                                className="w-full bg-[#1C1C1E] hover:bg-white/5 text-white font-medium py-3 rounded-xl border border-white/5 transition-all text-sm"
                            >
                                Limpar Cache e Ir para Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
