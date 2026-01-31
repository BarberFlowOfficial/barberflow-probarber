import { supabase } from '../supabase';

export interface BarberRankingItem {
    barber_name: string;
    avatar_url: string;
    total_services: number;
}

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
}

export const getUserProfessionalProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('[barberService] getUserProfessionalProfile for userId:', userId);

    // 1. Tenta Dono
    const { data: owner } = await supabase
        .from('barbers_owners')
        .select('shop_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (owner) {
        return {
            shopId: owner.shop_id,
            userRole: 'owner'
        };
    }

    // 2. Tenta Barbeiro
    const { data: barber } = await supabase
        .from('barbers')
        .select('id, shop_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (barber) {
        return {
            shopId: barber.shop_id,
            barberId: barber.id,
            userRole: 'barber'
        };
    }

    return null;
};

export const getDailyBarberRanking = async (shopId: string, date: string): Promise<BarberRankingItem[]> => {
    const { data, error } = await supabase
        .rpc('get_daily_barber_ranking', {
            p_shop_id: shopId,
            p_target_date: date
        });


    if (error) {
        console.error('Error fetching daily barber ranking:', error);
        throw error;
    }

    // Map the response to ensure types are correct (Supabase RPC can return numbers/strings for BIGINT)
    return (data || []).map((item: any) => ({
        barber_name: item.barber_name,
        avatar_url: item.avatar_url,
        total_services: Number(item.total_services) // Ensure BigInt/string is converted to number
    }));
};

export const getUpcomingAppointments = async (shopId: string): Promise<UpcomingAppointment[]> => {
    const { data, error } = await supabase
        .rpc('get_upcoming_appointments', {
            p_shop_id: shopId
        });

    if (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw error;
    }

    return (data || []).map((item: any) => ({
        appointment_id: item.appointment_id,
        customer_name: item.client_name || item.customer_name, // Support both just in case
        customer_avatar_url: item.customer_avatar_url || null,
        services_list: item.services_list || 'Nenhum serviço',
        appointment_time: item.appointment_time,
        status: item.status || 'confirmed',
        barber_name: item.barber_name,
        client_whatsapp: item.client_whatsapp || item.customer_phone || item.whatsapp || item.phone || item.client_phone || null
    }));
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
export interface DashboardSummary {
    completed_on_date: number;
    total_subscribers: number;
    active_barbers_count: number;
    daily_revenue: number;
    projected_revenue: number;
}

export interface DashboardSummarySchedule {
    agendados: number;
    finalizados: number;
    ocupacao_percentual: number;
    faturado: number;
}

export const getDashboardSummary = async (shopId: string, date: string): Promise<DashboardSummary> => {
    const { data, error } = await supabase
        .rpc('get_dashboard_summary', {
            p_shop_id: shopId,
            p_target_date: date
        });

    if (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }

    const result = data && data.length > 0 ? data[0] : {};

    return {
        completed_on_date: Number(result.completed_on_date || 0),
        total_subscribers: Number(result.total_subscribers || 0),
        active_barbers_count: Number(result.active_barbers_count || 0),
        daily_revenue: Number(result.daily_revenue || 0),
        projected_revenue: Number(result.projected_revenue || 0)
    };
};

export const getDashboardSummarySchedule = async (shopId: string, date: string, barberId: string | null = null): Promise<DashboardSummarySchedule> => {
    const { data, error } = await supabase
        .rpc('get_dashboard_summary_schedule', {
            p_shop_id: shopId,
            p_target_date: date,
            p_barber_id: barberId
        });

    if (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }

    const result = data && data.length > 0 ? data[0] : {};

    return {
        agendados: Number(result.agendados || 0),
        finalizados: Number(result.finalizados || 0),
        ocupacao_percentual: Number(result.ocupacao_percentual || 0),
        faturado: Number(result.faturado || 0)
    };
};

export interface DashboardInsights {
    peak_hour_text: string;
    peak_appointments_count: number;
    occupancy_rate_percent: number;
}

export const getDashboardInsights = async (shopId: string, date: string): Promise<DashboardInsights> => {
    const { data, error } = await supabase
        .rpc('get_dashboard_insights', {
            p_shop_id: shopId,
            p_target_date: date
        });

    if (error) {
        console.error('Error fetching dashboard insights:', error);
        throw error;
    }

    const result = data && data.length > 0 ? data[0] : {};

    // Adjust peak_hour_text if it exists (Fixing 3h timezone offset)
    let peakHour = result.peak_hour_text || '--:--';
    if (peakHour !== '--:--') {
        try {
            // Assuming the server returns UTC time in HH:mm or HH:mm:ss format
            const [hours, minutes] = peakHour.split(':');
            const date = new Date();
            date.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            // Format to local HH:mm
            peakHour = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (e) {
            console.error('Error Adjusting Peak Hour Timezone:', e);
        }
    }

    return {
        peak_hour_text: peakHour,
        peak_appointments_count: Number(result.peak_appointments_count || 0),
        occupancy_rate_percent: Number(result.occupancy_rate_percent || 0)
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

/**
 * Fetches the shop details.
 * If shopId is provided, it fetches by ID.
 * If userId is provided, it first fetches the user's professional profile to get the shopId.
 * Otherwise, it uses the hardcoded slug as a fallback.
 */
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

export interface ShopServiceItem {
    id: string;
    name: string;
    category: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
    description?: string;
    signature_benefits?: string;
    total_members?: number;
    included_services?: string[];
    discount_percentage?: number; // Added
    is_shared?: boolean;
    max_members?: number;
    usage_limit?: number | null;
    limit_appointments?: boolean;
    // Legacy fields for compatibility
    is_subscription?: boolean;
    appointments_limit?: number | null;
}

export const getShopServicesList = async (shopId: string): Promise<ShopServiceItem[]> => {
    const { data, error } = await supabase.rpc('get_shop_services_list', {
        p_shop_id: shopId
    });

    if (error) {
        console.error('Error fetching shop services:', error);
        throw error;
    }

    return data || [];
};

export interface ShopSignatureSummary {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
    signature_benefits: string;
    total_members: number;

    max_members?: number;
    is_shared?: boolean;
    usage_limit?: number | null;
    limit_appointments?: boolean;
}

export const getShopSignaturesSummary = async (shopId: string): Promise<ShopSignatureSummary[]> => {
    const { data, error } = await supabase.rpc('get_shop_signatures_summary', {
        p_shop_id: shopId
    });

    if (error) {
        console.error('Error fetching shop signatures summary:', error);
        throw error;
    }

    return data || [];
};

export interface CreateServicePayload {
    p_shop_id: string;
    p_name: string;
    p_category: 'hair' | 'beard' | 'combo' | 'signature';
    p_price: number;
    p_duration_minutes: number;
    p_child_service_ids?: string[];
    p_signature_benefits?: string;
    p_discount_percentage?: number; // Added
    p_is_shared?: boolean;
    p_is_subscription?: boolean;
    p_max_members?: number;
    p_usage_limit?: number | null;
    p_limit_appointments?: boolean;
}

export const createFullService = async (payload: CreateServicePayload) => {
    const safePayload = {
        ...payload,
        p_price: Number(payload.p_price),
        p_child_service_ids: Array.isArray(payload.p_child_service_ids) ? payload.p_child_service_ids : [],
        p_discount_percentage: Number(payload.p_discount_percentage || 0),
        p_is_shared: !!payload.p_is_shared,
        p_is_subscription: !!payload.p_is_subscription,
        p_max_members: Number(payload.p_max_members || 1),
        p_usage_limit: payload.p_usage_limit,
        p_limit_appointments: !!payload.p_limit_appointments
    };

    const { data, error } = await supabase.rpc('create_full_service', safePayload);

    if (error) {
        console.error('Error creating service:', error);
        throw error;
    }

    return data;
};

export const createFullAppointment = async (payload: {
    barberId: string;
    clientName: string;
    clientWhatsapp: string;
    appointmentTime: string;
    serviceIds: string[];
}) => {
    const { data, error } = await supabase.rpc('create_full_appointment', {
        p_barber_id: payload.barberId,
        p_client_name: payload.clientName,
        p_client_whatsapp: payload.clientWhatsapp,
        p_appointment_time: payload.appointmentTime,
        p_service_ids: payload.serviceIds
    });

    if (error) {
        console.error('Error creating appointment (RPC Error):', error);
        throw error;
    }

    return data;
};

export const bulkUpdateAppointmentsStatus = async (payload: {
    appointmentIds: string[];
    status: string;
}) => {
    const { data, error } = await supabase.rpc('bulk_update_appointments_status', {
        p_appointment_ids: payload.appointmentIds,
        p_status: payload.status
    });

    if (error) {
        console.error('Error in bulk_update_appointments_status RPC:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }

    return data;
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

export const updateAppointment = async (appointmentId: string, payload: {
    appointmentTime?: string;
    barberId?: string;
    clientName?: string;
    clientWhatsapp?: string;
    serviceDurationMinutes?: number;
    serviceIds?: string[];
    services?: any[]; // Full service objects to update de-normalized column
}) => {
    const updateData: any = {
        updated_at: new Date().toISOString()
    };

    if (payload.appointmentTime) updateData.appointment_time = payload.appointmentTime;
    if (payload.barberId) updateData.barber_id = payload.barberId;
    if (payload.clientName) updateData.client_name = payload.clientName;
    if (payload.clientWhatsapp) updateData.client_whatsapp = payload.clientWhatsapp;
    if (payload.serviceDurationMinutes) updateData.service_duration_minutes = payload.serviceDurationMinutes;

    // If services are provided, update 'services' column (was services_json)
    if (payload.services && payload.services.length > 0) {
        updateData.services = payload.services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price
        }));
    }

    const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error('Error updating appointment:', error);
        throw error;
    }

    // Note: In a production environment with a normalized schema, 
    // we would also need to update the appointment_services junction table.
    // However, since we don't have an RPC or clear schema for that, 
    // and the UI relies on services_json, updating it directly is a start.

    return data;
};

export interface UpdateServicePayload {
    p_service_id: string;
    p_shop_id: string; // Required now
    p_name: string;
    p_category: 'hair' | 'beard' | 'combo' | 'signature';
    p_price: number;
    p_duration_minutes: number;
    p_child_service_ids?: string[];
    p_signature_benefits?: string;
    p_discount_percentage?: number; // Added
    p_is_active?: boolean;
    p_is_shared?: boolean;
    p_is_subscription?: boolean;
    p_max_members?: number;
    p_usage_limit?: number | null;
    p_limit_appointments?: boolean;
}

export const updateFullService = async (payload: UpdateServicePayload) => {
    const safePayload = {
        ...payload,
        p_price: Number(payload.p_price),
        p_child_service_ids: Array.isArray(payload.p_child_service_ids) ? payload.p_child_service_ids : [],
        p_discount_percentage: Number(payload.p_discount_percentage || 0),
        p_is_shared: !!payload.p_is_shared,
        p_is_subscription: !!payload.p_is_subscription,
        p_max_members: Number(payload.p_max_members || 1),
        p_usage_limit: payload.p_usage_limit,
        p_limit_appointments: !!payload.p_limit_appointments
    };

    const { data, error } = await supabase.rpc('update_full_service', safePayload);

    if (error) {
        console.error('Error updating service:', error);
        throw error;
    }

    return data;
};

export interface MembershipSubscriber {
    customer_id: string;
    customer_name: string;
    customer_whatsapp: string;
    plan_name: string;
    due_date: string; // DD/MM/YYYY
    status: 'active' | 'pending' | 'canceled';
}

export const getMembershipSubscribers = async (shopId: string, signatureId: string | null, searchQuery: string = '', statusFilter: string | null = null): Promise<MembershipSubscriber[]> => {
    const { data, error } = await supabase.rpc('get_membership_subscribers', {
        p_shop_id: shopId,
        p_signature_id: signatureId,
        p_search_query: searchQuery || '', // Ensure empty string if falsy
        p_status_filter: (!statusFilter || statusFilter === 'all') ? null : statusFilter
    });

    if (error) {
        console.error('Error fetching membership subscribers:', error);
        throw error;
    }

    return (data || []).map((item: any) => ({
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        customer_whatsapp: item.customer_whatsapp,
        plan_name: item.plan_name,
        due_date: item.next_billing_date || item.due_date || null, // Map next_billing_date or fallback
        status: item.status
    }));
};

export const removeSubscriberFromSignature = async (customerId: string) => {
    // "definir signature_id como null e is_member como false no banco"
    // We can try a direct update first as it's simple
    const { error } = await supabase
        .from('barbershop_customers') // Assuming table name, need to verify or use RPC if exists
        .update({
            signature_id: null,
            is_member: false
        })
        .eq('id', customerId);

    if (error) {
        // Fallback or specific RPC if table access fails
        console.error('Error removing subscriber:', error);
        throw error;
    }
    return true;
};

export const toggleServiceActiveStatus = async (serviceId: string, isActive: boolean) => {
    const { error } = await supabase
        .from('services') // Unified table for services/combos/signatures
        .update({ is_active: isActive })
        .eq('id', serviceId);

    if (error) {
        console.error('Error toggling service status:', error);
        throw error;
    }
};

export const updateShopSettings = async (payload: {
    shopId: string;
    name: string;
    logo_url: string | null;
    description: string;
    whatsapp: string;
    instagram: string;
    cep: string;
    address: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
}) => {
    const { data, error } = await supabase.rpc('update_shop_settings', {
        p_shop_id: payload.shopId,
        p_name: payload.name || '',
        p_logo_url: payload.logo_url || null,
        p_description: payload.description || '',
        p_whatsapp: (payload.whatsapp || '').replace(/\D/g, ''),
        p_instagram: payload.instagram || '',
        p_cep: payload.cep || '',
        p_address: payload.address || '',
        p_number: payload.number || '',
        p_neighborhood: payload.neighborhood || '',
        p_city: payload.city || '',
        p_state: payload.state || ''
    });

    console.log('Dados = ', data);

    if (error) {
        console.error('Error updating shop settings:', error);
        throw error;
    }

    return data;
};

export const uploadShopLogo = async (shopId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${shopId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

    // Update the shop's logo_url in the database
    const { error: updateError } = await supabase
        .from('shops')
        .update({ logo_url: publicUrl })
        .eq('id', shopId);

    if (updateError) {
        console.error('Error updating shop logo URL:', updateError);
        throw updateError;
    }

    return publicUrl;
};

export const updateShopBusinessHours = async (shopId: string, businessHours: any) => {
    const { data, error } = await supabase.rpc('update_shop_business_hours', {
        p_shop_id: shopId,
        p_business_hours: businessHours
    });

    if (error) {
        console.error('Error updating business hours:', error);
        throw error;
    }

    return data;
};
export interface FinancialDashboardData {
    summary: {
        revenue: number;
        expenses: number;
        net_profit: number;
    };
    chart_data: Array<{
        date: string;
        income: number;
        expense: number;
    }>;
    categories: Array<{
        name: string;
        value: number;
        color?: string;
    }>;
    payment_methods: Array<{
        method: string;
        total: number;
        percentage: number;
    }>;
    revenue_origin: {
        subscriptions: {
            amount: number;
            percentage: number;
        };
        one_off_services: {
            amount: number;
            percentage: number;
        };
    };
    recent_transactions: Array<{
        id: string;
        description: string;
        type: 'income' | 'expense';
        amount: number;
        time_only: string;
    }>;
}

export interface DetailedCommissionsData {
    summary: {
        paid: number;
        pending: number;
    };
    commissions: Array<{
        id: string;
        barber_name: string;
        service_description: string;
        date: string;
        formatted_date: string;
        total_service_value: number;
        commission_amount: number;
        status: 'paid' | 'pending';
    }>;
}

export const getDetailedCommissionsReport = async (
    shopId: string,
    startDate: string,
    endDate: string,
    barberId?: string | null, // Optional filter
    status?: 'paid' | 'pending' | null // Optional filter
): Promise<DetailedCommissionsData> => {
    // Ensure barberId is null if it's 'all' or undefined/empty
    const rpcBarberId = (barberId === 'all' || !barberId) ? null : barberId;

    const { data, error } = await supabase.rpc('get_detailed_commissions_report', {
        p_shop_id: shopId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_barber_id: rpcBarberId,
        p_status: status
    });

    console.log('Dados 2 = ', data);

    if (error) {
        console.error('Error fetching detailed commissions report:', error);
        throw error;
    }

    const summary = data.summary || { paid: 0, pending: 0 };

    return {
        summary: {
            paid: Number(summary.paid || 0),
            pending: Number(summary.pending || 0)
        },
        commissions: (data.commissions || []).map((c: any) => ({
            id: c.id,
            barber_name: c.barber_name || 'Desconhecido',
            service_description: c.service_description,
            date: c.date,
            formatted_date: c.formatted_date,
            total_service_value: Number(c.total_service_value || 0),
            commission_amount: Number(c.commission_amount || 0),
            status: c.status
        }))
    };
};

export interface TransactionListData {
    balance_summary: {
        total_income: number;
        total_outcome: number;
        net_balance: number;
    };
    transactions: Array<{
        id: string;
        title: string;
        type: 'income' | 'outcome';
        value: number;
        date: string;
        formatted_date: string;
        barberName?: string;
    }>;
}

export const getTransactionsList = async (
    shopId: string,
    startDate: string,
    endDate: string,
    type: 'income' | 'outcome' | 'all' | 'expense' | null
): Promise<TransactionListData> => {
    let rpcType = null;
    if (type === 'income') rpcType = 'income';
    if (type === 'outcome' || type === 'expense') rpcType = 'outcome';

    const { data, error } = await supabase.rpc('get_transaction_list', {
        p_shop_id: shopId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_type: rpcType
    });

    if (error) {
        console.error('Error fetching transaction list:', error);
        throw error;
    }

    const summary = data.balance_summary || { total_income: 0, total_outcome: 0, net_balance: 0 };

    return {
        balance_summary: {
            total_income: Number(summary.total_income || 0),
            total_outcome: Number(summary.total_outcome || 0),
            net_balance: Number(summary.net_balance || 0)
        },
        transactions: (data.transactions || []).map((t: any) => ({
            id: t.id,
            title: t.description || 'Sem descrição', // Mapping description to title as per UI logic
            type: t.type,
            value: Number(t.amount || 0),
            date: t.date,
            formatted_date: t.formatted_date,
            barberName: t.barber_name
        }))
    };
};

export interface PeriodCommissionsData {
    total_paid: number;
    total_pending: number;
    barbers: Array<{
        id: string;
        name: string;
        avatar_url: string | null;
        total_commission: number;
        status: 'paid' | 'pending';
    }>;
}

export const getPeriodCommissions = async (
    shopId: string,
    startDate: string,
    endDate: string
): Promise<PeriodCommissionsData> => {
    const { data, error } = await supabase.rpc('get_period_commissions', {
        p_shop_id: shopId,
        p_start_date: startDate,
        p_end_date: endDate
    });

    console.log('Dados = ', data);

    if (error) {
        console.error('Error fetching period commissions:', error);
        throw error;
    }

    return {
        total_paid: Number(data.total_paid || 0),
        total_pending: Number(data.total_pending || 0),
        barbers: (data.barbers || []).map((b: any) => ({
            id: b.barber_id, // Ensure RPC returns barber_id
            name: b.barber_name || 'Desconhecido',
            avatar_url: b.avatar_url,
            total_commission: Number(b.total_commission || 0),
            status: b.status || 'pending'
        }))
    };
};

const translatePaymentMethod = (method: string): string => {
    const map: Record<string, string> = {
        'credit_card': 'Cartão de Crédito',
        'debit_card': 'Cartão de Débito',
        'pix': 'Pix',
        'cash': 'Dinheiro'
    };
    return map[method] || method.charAt(0).toUpperCase() + method.slice(1);
};

export const getFinancialDashboard = async (
    shopId: string,
    startDate: string,
    endDate: string
): Promise<FinancialDashboardData> => {
    const { data, error } = await supabase.rpc('get_financial_dashboard', {
        p_shop_id: shopId,
        p_start_date: startDate,
        p_end_date: endDate
    });

    console.log('Dados = ', data);

    if (error) {
        console.error('Error fetching financial dashboard:', error);
        throw error;
    }

    // Ensure numeric types
    const summary = data.summary || { revenue: 0, expenses: 0, net_profit: 0 };

    const totalRevenueOrigin = data.revenue_origin?.subscriptions + data.revenue_origin?.one_off_services;

    return {
        summary: {
            revenue: Number(summary.revenue || 0),
            expenses: Number(summary.expenses || 0),
            net_profit: Number(summary.net_profit || 0)
        },
        chart_data: (data.chart_data || []).map((item: any) => ({
            date: item.date,
            income: Number(item.income || 0),
            expense: Number(item.expense || 0)
        })),
        categories: (data.categories || []).map((item: any) => ({
            name: item.name,
            value: Number(item.value || 0),
            color: item.color
        })),
        payment_methods: (data.payment_methods || []).map((item: any) => ({
            method: translatePaymentMethod(item.method || 'Outro'),
            total: Number(item.total || 0),
            percentage: Number(item.percentage || 0)
        })),
        revenue_origin: {
            subscriptions: {
                amount: Number(data.revenue_origin?.subscriptions || 0),
                percentage: Number(((data.revenue_origin?.subscriptions / totalRevenueOrigin) * 100).toFixed(2))
            },
            one_off_services: {
                amount: Number(data.revenue_origin?.one_off_services || 0),
                percentage: Number(((data.revenue_origin?.one_off_services / totalRevenueOrigin) * 100).toFixed(2))
            }
        },
        recent_transactions: (data.recent_transactions || []).map((item: any) => ({
            id: item.id,
            description: item.description,
            type: item.type,
            amount: Number(item.amount || 0),
            time_only: item.time_only
        }))
    };
};

interface FinalizeTransactionParams {
    appointmentId: string;
    amount: number;
    paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
    description: string;
}

export const finalizeAppointmentWithTransaction = async ({ appointmentId, amount, paymentMethod, description }: FinalizeTransactionParams) => {
    const { data, error } = await supabase.rpc('finalize_appointment_with_transaction', {
        p_appointment_id: appointmentId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_description: description
    });

    console.log('Dados finalizeAppointmentWithTransaction = ', data);

    if (error) throw error;
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

export const uploadBarberAvatar = async (shopId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${shopId}_barber_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('barbers')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading barber avatar:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('barbers')
        .getPublicUrl(filePath);

    return publicUrl;
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

// IMPORTANT: Ensure the 'barbers_owners' table (link table) has correct mappings.
// If the app gets stuck in 'Loading', check if this RPC returns correct UUID from barbers_owners.
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
