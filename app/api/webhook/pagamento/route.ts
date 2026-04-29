import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { timingSafeEqual } from 'crypto';

function verifyWebhookToken(received: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !received) return false;

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const receivedToken = request.headers.get('asaas-access-token');

    if (!verifyWebhookToken(receivedToken)) {
      return NextResponse.json(
        { message: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gateway_id, status, beneficiario_id } = body;

    if (!gateway_id || !status || !beneficiario_id) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const { error: paymentError } = await supabaseAdmin
      .from('pagamentos')
      .update({
        status,
        pago_em: status === 'pago' ? new Date().toISOString() : null,
      })
      .eq('gateway_id', gateway_id);

    if (paymentError) {
      return NextResponse.json(
        { message: 'Erro ao atualizar pagamento' },
        { status: 400 }
      );
    }

    if (status === 'pago') {
      const { error: benefError } = await supabaseAdmin
        .from('beneficiarios')
        .update({
          status: 'ativo',
          plano_inicio: new Date().toISOString().split('T')[0],
          plano_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          sorteio_participa: true,
        })
        .eq('id', beneficiario_id);

      if (benefError) {
        return NextResponse.json(
          { message: 'Erro ao ativar beneficiário' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Webhook processado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
