import React, { createContext, useContext, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    shopId: string | null;
    barberId: string | null;
    userRole: 'owner' | 'barber' | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

// MOCK DATA CONSTANTS (DEV MODE)
const MOCK_USER = {
    id: 'dev-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@barber.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    last_sign_in_at: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
        name: 'Barbeiro Dev',
        avatar_url: 'https://github.com/shadcn.png',
        phone: '(11) 99999-9999'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as User;

const MOCK_SESSION = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: MOCK_USER
} as Session;

const MOCK_SHOP_ID = 'shop-123';
const MOCK_ROLE = 'barber'; // 'owner' or 'barber'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // FORCE MOCK STATE
    const [session] = useState<Session | null>(MOCK_SESSION);
    const [user] = useState<User | null>(MOCK_USER);
    const [shopId] = useState<string | null>(MOCK_SHOP_ID);
    const [userRole] = useState<'owner' | 'barber' | null>(MOCK_ROLE);
    const [isLoading] = useState(false); // No loading needed for mock

    // BYPASS REAL VALIDATION FOR NOW
    /*
    const validateProfile = useCallback(async (userId: string) => {
        // ... original logic ...
    }, []);
    */

    /*
    useEffect(() => {
       // ... original auth subscription ...
    }, [validateProfile]);
    */

    return (
        <AuthContext.Provider value={{
            session,
            user,
            shopId,
            barberId: 'barber-123', // Mock barber ID
            userRole,
            isLoading,
            signOut: async () => {
                console.log('Mock SignOut clicked');
                // localStorage.clear(); 
                // await supabase.auth.signOut(); 
                // window.location.reload(); 
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};