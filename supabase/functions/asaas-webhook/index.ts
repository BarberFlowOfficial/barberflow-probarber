import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  console.log("[Webhook] Função iniciada");

  const ASAAS_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  const receivedToken = req.headers.get("asaas-access-token");

  if (!receivedToken || receivedToken !== ASAAS_TOKEN) {
    console.error("[Webhook] Token inválido");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    console.log("[Webhook] Body recebido:", JSON.stringify(body));

    const event = body?.event;
    const payment = body?.payment;

    if (!event || !payment) {
      console.error("[Webhook] Payload inválido");
      return new Response(JSON.stringify({ error: "Payload inválido" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`[Webhook] Evento: ${event} | Payment ID: ${payment.id}`);

    if (event !== "PAYMENT_RECEIVED") {
      console.log(`[Webhook] Evento ${event} ignorado`);
      return new Response(JSON.stringify({ success: true, message: "Evento ignorado" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Webhook] Variáveis de ambiente não configuradas");
      return new Response(JSON.stringify({ error: "Config error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // IDEMPOTÊNCIA
    const { data: existingPayment } = await supabase
      .from('appointments')
      .select('id')
      .eq('asaas_payment_id', payment.id)
      .maybeSingle();

    if (existingPayment) {
      console.log(`[Webhook] Pagamento ${payment.id} já processado.`);
      return new Response(JSON.stringify({ success: true, message: "Já processado" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // BUSCAR APPOINTMENT
    const externalRef = payment.externalReference;
    console.log(`[Webhook] Buscando appointment: ${externalRef}`);

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, barber_id, client_name, services, payment_status')
      .eq('external_reference', externalRef)
      .maybeSingle();

    if (!appointment) {
      console.error(`[Webhook] Appointment não encontrado: ${externalRef}`);
      return new Response(JSON.stringify({ error: "Appointment não encontrado" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (appointment.payment_status === 'pago') {
      console.log(`[Webhook] Já pago: ${appointment.id}`);
      return new Response(JSON.stringify({ success: true, message: "Já pago" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // BUSCAR BARBEIRO
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .select('shop_id, commission_rate')
      .eq('id', appointment.barber_id)
      .single();

    if (!barber) {
      console.error(`[Webhook] Barbeiro não encontrado: ${appointment.barber_id}`);
      return new Response(JSON.stringify({ error: "Barbeiro não encontrado" }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // CALCULAR VALORES
    const amount = Number(payment.value) || 0;
    const commissionRate = Number(barber.commission_rate) || 0;
    const commissionAmount = (amount * commissionRate) / 100;

    let serviceNames = "Serviço prestado";
    try {
      if (appointment.services) {
        const services = typeof appointment.services === 'string' 
          ? JSON.parse(appointment.services) 
          : appointment.services;
        if (Array.isArray(services)) {
          const names = services.map((s: any) => s?.name).filter(Boolean);
          if (names.length > 0) serviceNames = names.join(", ");
        }
      }
    } catch (e) {
      console.log("[Webhook] Erro ao parsear services");
    }

    const paymentMethodMap: Record<string, string> = {
      PIX: "pix",
      CREDIT_CARD: "credito",
      DEBIT_CARD: "debito",
      BOLETO: "boleto"
    };
    const paymentMethod = paymentMethodMap[payment.billingType] || "outros";

    // ═══════════════════════════════════════════════════════════════
    // CRIAR TRANSAÇÃO (COM DEBUG COMPLETO)
    // ═══════════════════════════════════════════════════════════════
    const transactionData = {
      shop_id: barber.shop_id,
      appointment_id: appointment.id,
      amount: amount,
      type: 'income',
      category: 'Serviço',
      payment_method: paymentMethod,
      description: serviceNames,
      origin_type: 'service_avulso',
      commission_amount: commissionAmount,
      status: 'paid',
      created_at: new Date().toISOString()
    };

    console.log("[Webhook] Tentando inserir transação:", JSON.stringify(transactionData));

    const { data: insertedTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error("[Webhook] ❌ ERRO TRANSAÇÃO - Código:", transactionError.code);
      console.error("[Webhook] ❌ ERRO TRANSAÇÃO - Mensagem:", transactionError.message);
      console.error("[Webhook] ❌ ERRO TRANSAÇÃO - Detalhes:", transactionError.details);
      console.error("[Webhook] ❌ ERRO TRANSAÇÃO - Hint:", transactionError.hint);
    } else {
      console.log("[Webhook] ✅ Transação criada com ID:", insertedTransaction?.id);
    }

    // ATUALIZAR APPOINTMENT
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        payment_status: 'pago',
        asaas_payment_id: payment.id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment.id);

    if (updateError) {
      console.error("[Webhook] Erro ao atualizar appointment:", updateError.message);
    }

    console.log(`[Webhook] ✅ FINALIZADO - Appointment: ${appointment.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      appointment_id: appointment.id,
      transaction_created: !transactionError,
      amount: amount,
      commission: commissionAmount
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[Webhook] ERRO CRÍTICO:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
});