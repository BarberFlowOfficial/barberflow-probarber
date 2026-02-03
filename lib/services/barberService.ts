import { supabase } from '../supabase';

export interface BarberProfileBasics {
    name: string;
    avatar_url: string;
    email: string;
    cpf: string;
    telefone: string;
}

export const getBarberProfile = async (userId: string): Promise<BarberProfileBasics | null> => {
    console.log('[RPC] Chamando get_barber_profile_basics com ID:', userId);
    const { data, error } = await supabase.rpc('get_barber_profile_basics', {
        p_user_id: userId
    });
    console.log("getBarberProfile: data", data);
    if (error) {
        console.error('Error fetching barber profile:', error);
        return null;
    }

    if (data && Array.isArray(data) && data.length > 0) {
        const profile = data[0];
        return {
            ...profile,
            telefone: profile.phone || profile.telefone || ''
        } as BarberProfileBasics;
    } else if (data && !Array.isArray(data)) {
        return {
            ...data,
            telefone: data.phone || data.telefone || ''
        } as BarberProfileBasics;
    }

    return null;
};

export const updateBarberProfileBasics = async (userId: string, profileData: BarberProfileBasics) => {
    const { data, error } = await supabase.rpc('update_barber_profile_basics', {
        p_user_id: userId,
        p_name: profileData.name,
        p_avatar_url: profileData.avatar_url,
        p_email: profileData.email,
        p_cpf: profileData.cpf,
        p_telefone: profileData.telefone
    });

    if (error) {
        console.error('Error updating barber profile:', error);
        throw error;
    }

    return data;
};

export interface UpcomingAppointment {
    appointment_id: string;
    customer_name: string;
    customer_avatar_url: string | null;
    services_list: string;
    appointment_time: string;
    status: string;
    barber_name: string;
    client_whatsapp: string | null;
}

export interface UserProfile {
    shopId: string;
    barberId?: string;
    userRole: 'owner' | 'barber';
    [key: string]: any; // Allow dynamic fields from DB
}

export const getUserProfessionalProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('[barberService] getUserProfessionalProfile for userId:', userId);

    const { data: barber } = await supabase
        .from('barbers')
        .select('*') // Capture all fields
        .eq('user_id', userId)
        .maybeSingle();

    if (barber) {
        return {
            ...barber, // Spread all DB fields
            shopId: barber.shop_id,
            barberId: barber.id,
            userRole: 'barber'
        };
    }

    return null;
};

export interface BarberDashboardData {
    barber_name: string;
    barber_photo: string | null;
    total_earnings: number;
    wallet: {
        balance: number;
        reserved_balance: number;
    };
    upcoming_appointments: UpcomingAppointment[];
    is_active: boolean;
    barber_id: string;
}

export const getBarberDashboardData = async (
    userId: string,
    startDate: string,
    endDate: string
): Promise<BarberDashboardData> => {
    console.log('userId:', userId);

    const { data, error } = await supabase.rpc('get_barber_dashboard_data', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate
    });

    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
        console.error('Error fetching barber dashboard data:', error);
        throw error;
    }

    const result = data || {};

    return {
        barber_name: result.barber_name || 'Profissional',
        barber_photo: result.barber_photo || null,
        total_earnings: Number(result.total_earnings || 0),
        wallet: {
            balance: Number(result.wallet?.balance || 0),
            reserved_balance: Number(result.wallet?.reserved_balance || 0)
        },
        upcoming_appointments: (result.upcoming_appointments || []).map((item: any) => ({
            appointment_id: item.appointment_id,
            customer_name: item.customer_name || 'Cliente',
            customer_avatar_url: item.customer_avatar_url || null,
            services_list: item.services_list || 'Nenhum serviço',
            appointment_time: item.appointment_time,
            status: item.status || 'confirmed',
            barber_name: item.barber_name || '',
            client_whatsapp: item.client_whatsapp || null
        })),
        is_active: !!(result.is_active ?? result.active ?? true),
        barber_id: result.barber_id || result.id || ''
    };
};

export interface Shop {
    id: string;
    name: string;
    description?: string;
    barber_owner: string;
    logo_url?: string | null;
    whatsapp?: string;
    instagram?: string;
    cep?: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    business_hours?: any;
    redirect_url: string;
    terms_accepted?: boolean;
    terms_accepted_at?: string;
}

export const getShop = async (shopId: string | null = null, userId: string | null = null): Promise<Shop | null> => {
    try {
        console.log(`[getShop] Iniciando busca. shopId: ${shopId}, userId: ${userId}`);

        if (!shopId && userId) {
            const profile = await getUserProfessionalProfile(userId);
            if (profile) {
                shopId = profile.shopId;
                console.log(`[getShop] shopId extraído do perfil do usuário: ${shopId}`);
            }
        }

        if (shopId) {
            console.log(`[getShop] Tentando buscar por ID: ${shopId}`);
            const { data, error } = await supabase
                .from('shops')
                .select('id, name, barber_owner, logo_url, description, whatsapp_contact, instagram_handle, cep, address, number, neighborhood, city, state, redirect_url, terms_accepted, terms_accepted_at')
                .eq('id', shopId)
                .single();

            if (error) {
                console.error('[getShop] Erro ao buscar por ID:', error);
                return null;
            }
            console.log('[getShop] Sucesso ao buscar por ID:', data?.name);
            return data;
        }

        // Fallback or Legacy: fetch by slug
        console.log('[getShop] shopId não fornecido. Usando fallback por slug.');
        const { data, error } = await supabase.rpc('get_shop_by_redirect_url', {
            p_redirect_url: 'barbearianaregua-3caf'
        });

        if (error) {
            console.error('[getShop] Erro no RPC por slug:', error);
            const { data: directData, error: directError } = await supabase
                .from('shops')
                .select('id, name, barber_owner, logo_url, description, whatsapp_contact, instagram_handle, cep, address, number, neighborhood, city, state, redirect_url')
                .eq('slug', 'barbearianaregua-3caf')
                .single();

            if (directError) {
                console.error('[getShop] Busca direta por slug também falhou:', directError);
                return null;
            }
            console.log('[getShop] Sucesso na busca direta por slug:', directData?.name);
            return directData;
        }

        console.log('[getShop] Sucesso no RPC por slug:', data?.[0]?.name);
        return data?.[0] || null;
    } catch (e) {
        console.error('[getShop] Erro inesperado:', e);
        return null;
    }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error(`Error updating appointment ${appointmentId} to ${status}:`, error);
        throw error;
    }

    return data;
};

export const toggleBarberAvailability = async (barberId: string) => {
    const { data, error } = await supabase.rpc('toggle_barber_availability', {
        p_barber_id: barberId
    });

    console.log('Dados toggleBarberAvailability = ', data);

    if (error) throw error;
    return data; // Returns text message
};

export const getMyShopId = async (userId: string) => {
    console.log('1. getMyShopId: Iniciando busca para UID:', userId);

    // Timeout de 4 segundos para garantir que a aplicação não trave
    const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
            console.warn('4. getMyShopId: Timeout de 4s atingido. Tentando cache local.');
            resolve(null);
        }, 4000);
    });

    const fetchWorker = async () => {
        try {
            console.log('2. getMyShopId: Chamando RPC get_my_shop_id...');
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_shop_id', {
                p_user_id: userId
            });

            if (rpcData) {
                console.log('3. getMyShopId: Sucesso via RPC:', rpcData);
                return rpcData as string;
            }

            if (rpcError) console.warn('(!) getMyShopId: Falha no RPC, tentando busca direta...');

            console.log('5. getMyShopId: Iniciando busca direta na tabela barbers_owners...');
            const { data: fbData, error: fbError } = await supabase
                .from('barbers_owners')
                .select('shop_id')
                .eq('user_id', userId)
                .single();

            if (fbData?.shop_id) {
                console.log('6. getMyShopId: Sucesso via busca direta:', fbData.shop_id);
                return fbData.shop_id as string;
            }

            if (fbError) console.error('(!) getMyShopId: Erro no fallback direto:', fbError);

        } catch (err: any) {
            const isAborted = err.message?.includes('Fetch Aborted') || err.name === 'AbortError';
            if (isAborted) {
                console.warn('(!) getMyShopId: Requisição cancelada pelo sistema (provável redirecionamento).');
            } else {
                console.error('(!) getMyShopId: Erro capturado no fluxo:', err);
            }
        }
        return null;
    };

    // Corrida entre a busca real e o timeout
    const finalResult = await Promise.race([fetchWorker(), timeoutPromise]);

    if (!finalResult) {
        const cachedId = localStorage.getItem('barberflow_shop_id');
        console.log('7. getMyShopId: Retornando valor final (Cache fallback):', cachedId);
        return cachedId;
    }

    return finalResult;
};

export const acceptTerms = async (shopId: string) => {
    console.log('Accepting terms for shopId:', shopId);
    const { data, error } = await supabase
        .from('shops')
        .update({
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString()
        })
        .eq('id', shopId)
        .select();

    console.log('Dados acceptTerms = ', data);

    if (error) {
        console.error('Error in acceptTerms Supabase call:', error);
        throw error;
    }

    return data;
};
