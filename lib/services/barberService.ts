import { supabase } from '../supabase';

export interface BarberProfileBasics {
    name: string;
    avatar_url: string;
    email: string;
    cpf: string; // Maintain for UI compatibility
    cpf_cnpj: string; // Database column
    telefone: string;
    phone: string; // UI compatibility
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
            // Map 'cpf_cnpj' (DB) -> 'cpf' (UI)
            cpf: profile.cpf_cnpj || profile.cpf || '',
            cpf_cnpj: profile.cpf_cnpj || profile.cpf || '',
            // Map 'telefone' (DB) -> 'phone' (UI)
            phone: profile.telefone || profile.phone || '',
            telefone: profile.telefone || profile.phone || ''
        } as BarberProfileBasics;
    } else if (data && !Array.isArray(data)) {
        return {
            ...data,
            cpf: data.cpf_cnpj || data.cpf || '',
            cpf_cnpj: data.cpf_cnpj || data.cpf || '',
            phone: data.telefone || data.phone || '',
            telefone: data.telefone || data.phone || ''
        } as BarberProfileBasics;
    }

    return null;
};

// ... (keep updateBarberProfileBasics as is or check if it needs update too? User only mentioned getBarberProfile)

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
            // Passo 1: Busca na tabela barbers
            console.log('2. getMyShopId: Buscando na tabela barbers...');
            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select('shop_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (barberData?.shop_id) {
                console.log('3. getMyShopId: Sucesso tabela barbers:', barberData.shop_id);
                return barberData.shop_id as string;
            }

            // Passo 2 (Fallback): Busca na tabela barbers_owners
            console.log('5. getMyShopId: Fallback para tabela barbers_owners...');
            const { data: ownerData, error: ownerError } = await supabase
                .from('barbers_owners')
                .select('shop_id') // shop_id aqui é o ID da barbearia
                .eq('user_id', userId)
                .maybeSingle();

            if (ownerData?.shop_id) {
                console.log('6. getMyShopId: Sucesso tabela barbers_owners:', ownerData.shop_id);
                return ownerData.shop_id as string;
            }

            // Apenas loga erro se falhar em AMBOS e houver erro real (não apenas 'null')
            if (barberError) console.warn('(!) getMyShopId: Erro barbers:', barberError.message);
            if (ownerError) console.warn('(!) getMyShopId: Erro barbers_owners:', ownerError.message);

            console.warn('(!) getMyShopId: Shop ID não encontrado em nenhuma tabela.');

        } catch (err: any) {
            console.error('(!) getMyShopId: Erro capturado no fluxo:', err);
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

export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `profile-${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('[uploadProfileImage] Iniciando upload:', filePath);

        const { error: uploadError } = await supabase.storage
            .from('professional-logos')
            .upload(filePath, file);

        if (uploadError) {
            console.error('[uploadProfileImage] Erro no upload:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from('professional-logos')
            .getPublicUrl(filePath);

        console.log('[uploadProfileImage] URL gerada:', data.publicUrl);
        return data.publicUrl;
    } catch (e) {
        console.error('[uploadProfileImage] Erro inesperado:', e);
        return null;
    }
};

export const updateBarberProfileBasics = async (userId: string, profileData: BarberProfileBasics) => {
    console.log('[updateBarberProfileBasics] Chamando RPC update_barber_profile...');

    // Mapeamento para RPC update_barber_profile
    const params = {
        p_user_id: userId,
        p_name: profileData.name,
        p_email: profileData.email,
        p_telefone: profileData.telefone || profileData.phone, // Ensure phone is passed
        p_cpf: profileData.cpf || profileData.cpf_cnpj,       // Ensure CPF is passed
        p_avatar_url: profileData.avatar_url
    };

    console.log('[updateBarberProfileBasics] Parâmetros:', params);

    const { data, error } = await supabase.rpc('update_barber_profile', params);

    if (error) {
        console.error('Error updating barber profile:', error);
        throw error;
    }

    console.log('[updateBarberProfileBasics] Sucesso! Dados retornados:', data);
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

    console.log('✅ Dashboard Data:', data);
    console.log('Error:', error);

    if (error) {
        console.error('Error fetching barber dashboard data:', error);
        // Retornar um objeto vazio estruturado em caso de erro para manter o dashboard funcional
        return {
            barber_name: 'Profissional',
            barber_photo: null,
            total_earnings: 0,
            wallet: { balance: 0, reserved_balance: 0 },
            upcoming_appointments: [],
            is_active: true,
            barber_id: ''
        };
    }

    const result = data || {};

    // Verify if we need to enrich phone numbers (RPC might miss it)
    let enrichedAppointments = (result.upcoming_appointments || []).map((item: any) => ({
        appointment_id: item.appointment_id,
        customer_name: item.customer_name || 'Cliente',
        customer_avatar_url: item.customer_avatar_url || null,
        services_list: item.services_list || 'Nenhum serviço',
        appointment_time: item.appointment_time,
        status: item.status || 'confirmed',
        barber_name: item.barber_name || '',
        // Map all potential phone fields
        client_whatsapp: item.client_whatsapp || item.customer_phone || item.phone || item.whatsapp || null
    }));

    // If phones are missing, do a quick lookup
    const missingPhones = enrichedAppointments.filter((a: any) => !a.client_whatsapp);
    if (missingPhones.length > 0) {
        console.log('Fetching missing phone numbers for', missingPhones.length, 'appointments...');
        const appointmentIds = missingPhones.map((a: any) => a.appointment_id);

        const { data: details } = await supabase
            .from('appointments')
            .select('id, client_id, clients(phone, whatsapp)')
            .in('id', appointmentIds);

        if (details) {
            const phoneMap = new Map();
            details.forEach((d: any) => {
                // Prioritize whatsapp over phone
                const phone = d.clients?.whatsapp || d.clients?.phone;
                if (phone) phoneMap.set(d.id, phone);
            });

            enrichedAppointments = enrichedAppointments.map((a: any) => ({
                ...a,
                client_whatsapp: a.client_whatsapp || phoneMap.get(a.appointment_id) || null
            }));
        }
    }

    return {
        barber_name: result.barber_name || 'Profissional',
        barber_photo: result.barber_photo || null,
        total_earnings: Number(result.total_earnings || 0),
        wallet: {
            balance: Number(result.wallet?.balance || 0),
            reserved_balance: Number(result.wallet?.reserved_balance || 0)
        },
        upcoming_appointments: enrichedAppointments,
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

export const getShopDetails = async (shopId: string): Promise<{ name: string; logo_url: string | null; redirect_url: string } | null> => {
    try {
        const { data, error } = await supabase
            .from('shops')
            .select('name, logo_url, redirect_url')
            .eq('id', shopId)
            .single();

        if (error) {
            console.error('[getShopDetails] Error fetching shop details:', error);
            return null;
        }

        return data;
    } catch (e) {
        console.error('[getShopDetails] Unexpected error:', e);
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
