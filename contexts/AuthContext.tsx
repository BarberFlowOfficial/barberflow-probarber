import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    shopId: string | null;
    barberId: string | null;
    userRole: 'owner' | 'barber' | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

// 1. CAPTURA IMEDIATA (Fora do componente para ser instantâneo)
const getInitialTokenId = () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
        try {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('🚀 AuthContext: Token detectado na URL! ID:', payload.sub);
                return payload.sub;
            }
        } catch (e) {
            console.error('❌ Erro na extração síncrona:', e);
        }
    }
    return null;
};

const initialUserId = getInitialTokenId();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(initialUserId ? { id: initialUserId } as any : null);
    const [shopId, setShopId] = useState<string | null>(() => localStorage.getItem('barberflow_shop_id'));
    const [userRole, setUserRole] = useState<'owner' | 'barber' | null>(() => localStorage.getItem('barberflow_user_role') as any);
    const [isLoading, setIsLoading] = useState(true);

    const validateProfile = useCallback(async (userId: string) => {
        console.log('🔍 AuthContext: Validando perfil para:', userId);
        try {
            const [ownerRes, barberRes] = await Promise.all([
                supabase.from('barbers_owners').select('shop_id').eq('user_id', userId).maybeSingle(),
                supabase.from('barbers').select('id, shop_id').eq('user_id', userId).maybeSingle()
            ]);

            if (ownerRes.data) {
                setShopId(ownerRes.data.shop_id);
                setUserRole('owner');
                localStorage.setItem('barberflow_shop_id', ownerRes.data.shop_id);
                localStorage.setItem('barberflow_user_role', 'owner');
            } else if (barberRes.data) {
                setShopId(barberRes.data.shop_id);
                setUserRole('barber');
                localStorage.setItem('barberflow_shop_id', barberRes.data.shop_id);
                localStorage.setItem('barberflow_user_role', 'barber');
            }
        } catch (err) {
            console.error('❌ Erro ao buscar perfil:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Se já pegamos o ID manualmente, já começamos a validar o perfil
        if (initialUserId) {
            validateProfile(initialUserId);
        }

        // Sincronização oficial do Supabase (para manter a sessão viva)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                if (!initialUserId) validateProfile(session.user.id);
            } else if (!initialUserId) {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                validateProfile(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, [validateProfile]);

    return (
        <AuthContext.Provider value={{ session, user, shopId, barberId: null, userRole, isLoading, signOut: async () => { localStorage.clear(); await supabase.auth.signOut(); window.location.reload(); } }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};