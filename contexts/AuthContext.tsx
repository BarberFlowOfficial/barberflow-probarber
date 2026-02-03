import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserProfessionalProfile } from '../lib/services/barberService';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userProfile: any | null; // New field to store full profile
    shopId: string | null;
    barberId: string | null;
    userRole: 'owner' | 'barber' | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const extractTokenFromHash = () => {
    const hash = window.location.hash;
    if (!hash) return null;

    const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
    const accessToken = params.get('access_token');

    if (!accessToken) return null;

    try {
        // Decode JWT payload (part 2)
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing token:', e);
        return null;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null); // State for full profile
    const [shopId, setShopId] = useState<string | null>(null);
    const [barberId, setBarberId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'owner' | 'barber' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const validateProfile = async (userId: string) => {
        try {
            console.log('Validating profile for:', userId);
            const profile = await getUserProfessionalProfile(userId);

            if (profile) {
                console.log('Profile found:', profile);
                setUserProfile(profile); // Store full profile
                setShopId(profile.shopId);
                if (profile.barberId) setBarberId(profile.barberId);
                setUserRole(profile.userRole);
            } else {
                console.warn('No professional profile found for user:', userId);
            }
        } catch (error) {
            console.error('Error validating profile:', error);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // 1. Try to get token from URL (Priority)
            const tokenPayload = extractTokenFromHash();

            if (tokenPayload && tokenPayload.sub) {
                console.log('Token detected in URL. ID:', tokenPayload.sub);
                await validateProfile(tokenPayload.sub);
            }

            // 2. Standard Supabase Session Check
            const { data: { session: existingSession } } = await supabase.auth.getSession();

            if (mounted) {
                if (existingSession) {
                    setSession(existingSession);
                    setUser(existingSession.user);
                    // Cache User ID
                    if (existingSession.user?.id) {
                        localStorage.setItem('barberflow_user_id', existingSession.user.id);
                    }
                    if (!shopId) {
                        await validateProfile(existingSession.user.id);
                    }
                }
                setIsLoading(false);
            }

            // 3. Listen for changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
                if (!mounted) return;

                console.log('Auth state change:', _event);
                setSession(newSession);
                setUser(newSession?.user ?? null);

                // Immediate Persistence
                if (newSession?.user?.id) {
                    localStorage.setItem('barberflow_user_id', newSession.user.id);
                    console.log('[AuthContext] ID persistido no cache:', newSession.user.id);
                }

                if (newSession?.user && _event === 'SIGNED_IN') {
                    await validateProfile(newSession.user.id);
                } else if (_event === 'SIGNED_OUT') {
                    // Clear Cache
                    localStorage.removeItem('barberflow_user_id');
                    setUserProfile(null);
                    setShopId(null);
                    setBarberId(null);
                    setUserRole(null);
                    console.log('[AuthContext] Cache limpo após SignOut.');
                }

                setIsLoading(false);
            });

            return () => {
                mounted = false;
                subscription.unsubscribe();
            };
        };

        initAuth();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        // Clear Cache
        localStorage.removeItem('barberflow_user_id');
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setShopId(null);
        setBarberId(null);
        setUserRole(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            userProfile, // Expose full profile
            shopId,
            barberId,
            userRole,
            isLoading,
            signOut
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