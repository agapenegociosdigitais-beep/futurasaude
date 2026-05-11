import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEDUP_TTL_MS = 5 * 60 * 1000;

let dedupFallback = new Map<string, number>();

function verifyAsaasToken(received: string | null): boolean {
  // Aceita ambos os nomes para compatibilidade com Vercel (variável pode estar como ASAAS_WEBHOOK_TOKEN)
  const expected = process.env.ASAAS_WEBHOOK_SECRET || process.env.ASAAS_WEBHOOK_TOKEN;

  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      console.error('ASAAS_WEBHOOK_SECRET obrigatorio em producao');
      return false;
    }
    console.warn('ASAAS_WEBHOOK_SECRET nao configurado, aceitando webhook em modo dev');
    return true;
  }

  if (!received) return false;

  return received === expected;
}

async function isDuplicate(eventId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - DEDUP_TTL_MS).toISOString();

  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .gte('created_at', cutoff)
      .maybeSingle();

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('Tabela webhook_events nao encontrada, usando dedup em memoria');
        return isDuplicateFallback(eventId);
      }
      console.error('Erro ao verificar dedup:', error);
      return false;
    }

    if (data) return true;

    const { error: insertError } = await supabaseAdmin
      .from('webhook_events')
      .insert({ event_id: eventId });

    if (insertError) {
      console.error('Erro ao registrar evento webhook:', insertError);
    }

    return false;
  } catch {
    return isDuplicateFallback(eventId);
  }
}

function isDuplicateFallback(eventId: string): boolean {
  const now = Date.now();
  for (const [key, ts] of dedupFallback) {
    if (now - ts > DEDUP_TTL_MS) dedupFallback.delete(key);
  }

  if (dedupFallback.has(eventId)) return true;

  dedupFallback.set(eventId, now);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const receivedToken = request.headers.get('asaas-access-token');

    if (!verifyAsaasToken(receivedToken)) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    if (!payment?.id) {
      return NextResponse.json({ message: 'Dados de pagamento ausentes' }, { status: 400 });
    }

    const gatewayId = payment.id;
    const status = payment.status;
    const eventId = `${gatewayId}-${status}-${event || ''}`;

    if (event === 'PAYMENT_CREATED') {
      return NextResponse.json({ message: 'Evento de criacao ignorado' }, { status: 200 });
    }

    if (await isDuplicate(eventId)) {
      return NextResponse.json({ message: 'Evento ja processado' }, { status: 200 });
    }

    const { data: pagamentoExistente, error: findError } = await supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id, status')
      .eq('gateway_id', gatewayId)
      .maybeSingle();

    if (findError || !pagamentoExistente) {
      console.error('Pagamento nao encontrado:', gatewayId);
      return NextResponse.json({ message: 'Pagamento nao encontrado' }, { status: 404 });
    }

    if (pagamentoExistente.status === 'pago' && status !== 'REFUNDED') {
      return NextResponse.json({ message: 'Pagamento ja processado' }, { status: 200 });
    }

    let novoStatus = 'pendente';
    if (status === 'CONFIRMED' || status === 'RECEIVED') {
      novoStatus = 'pago';
    } else if (status === 'REFUNDED') {
      novoStatus = 'reembolsado';
    } else if (status === 'OVERDUE' || status === 'PAYMENT_FAILED') {
      novoStatus = 'falhou';
    }

    const { error: paymentError } = await supabaseAdmin
      .from('pagamentos')
      .update({
        status: novoStatus,
        pago_em: novoStatus === 'pago' ? new Date().toISOString() : null,
      })
      .eq('gateway_id', gatewayId);

    if (paymentError) {
      console.error('Erro ao atualizar pagamento:', paymentError);
      return NextResponse.json({ message: 'Erro ao atualizar pagamento' }, { status: 400 });
    }

    if (novoStatus === 'pago') {
      const dataInicio = new Date();
      const dataFim = new Date(dataInicio);
      dataFim.setFullYear(dataFim.getFullYear() + 1);

      const { error: benefError } = await supabaseAdmin
        .from('beneficiarios')
        .update({
          status: 'ativo',
          plano_inicio: dataInicio.toISOString().split('T')[0],
          plano_fim: dataFim.toISOString().split('T')[0],
          sorteio_participa: true,
        })
        .eq('id', pagamentoExistente.beneficiario_id);

      if (benefError) {
        console.error('Erro ao ativar beneficiario:', benefError);
        return NextResponse.json({ message: 'Erro ao ativar beneficiario' }, { status: 400 });
      }
    }

    if (novoStatus === 'reembolsado') {
      const { error: benefError } = await supabaseAdmin
        .from('beneficiarios')
        .update({
          status: 'cancelado',
          sorteio_participa: false,
        })
        .eq('id', pagamentoExistente.beneficiario_id);

      if (benefError) {
        console.error('Erro ao cancelar beneficiario:', benefError);
      }
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
