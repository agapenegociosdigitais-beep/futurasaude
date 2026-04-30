import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function verifyAsaasToken(received: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!expected) {
    console.warn('ASAAS_WEBHOOK_TOKEN não configurado, aceitando webhook em modo dev');
    return true;
  }

  if (!received) return false;

  return received === expected;
}

export async function POST(request: NextRequest) {
  try {
    const receivedToken = request.headers.get('asaas-access-token');

    if (!verifyAsaasToken(receivedToken)) {
      console.error('Token de webhook inválido');
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    const { event, payment } = body;

    if (!payment?.id) {
      return NextResponse.json(
        { message: 'Dados de pagamento ausentes' },
        { status: 400 }
      );
    }

    const gatewayId = payment.id;
    const status = payment.status;

    const { data: pagamentoExistente, error: findError } = await supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id')
      .eq('gateway_id', gatewayId)
      .single();

    if (findError || !pagamentoExistente) {
      console.error('Pagamento não encontrado:', gatewayId);
      return NextResponse.json(
        { message: 'Pagamento não encontrado' },
        { status: 404 }
      );
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
      return NextResponse.json(
        { message: 'Erro ao atualizar pagamento' },
        { status: 400 }
      );
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
        console.error('Erro ao ativar beneficiário:', benefError);
        return NextResponse.json(
          { message: 'Erro ao ativar beneficiário' },
          { status: 400 }
        );
      }

      console.log('Beneficiário ativado com sucesso:', pagamentoExistente.beneficiario_id);
    }

    return NextResponse.json(
      { message: 'Webhook processado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
