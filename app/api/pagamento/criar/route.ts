import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function criarCobrancaAsaas(beneficiarioId: string, valor: number, metodo: 'pix' | 'cartao_credito') {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    console.warn('ASAAS_API_KEY não configurada, usando modo simulado');
    return {
      id: `sim-${Date.now()}`,
      pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      pixCopyPaste: '00020126580014br.gov.bcb.pix0136' + beneficiarioId.substring(0, 20) + '520400005303986540599.905802BR5925FUTURA SAUDE6009SANTAREM62070503***6304XXXX',
      status: 'PENDING',
    };
  }

  const payload: any = {
    customer: beneficiarioId,
    billingType: metodo === 'pix' ? 'PIX' : 'CREDIT_CARD',
    value: valor,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Cartão Futura Saúde - Plano Anual',
    externalReference: beneficiarioId,
  };

  const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Erro Asaas:', error);
    throw new Error('Falha ao criar cobrança no gateway');
  }

  const data = await response.json();

  if (metodo === 'pix' && data.id) {
    const pixResponse = await fetch(`https://sandbox.asaas.com/api/v3/payments/${data.id}/pixQrCode`, {
      headers: { 'access_token': apiKey },
    });

    if (pixResponse.ok) {
      const pixData = await pixResponse.json();
      return {
        id: data.id,
        pixQrCode: pixData.encodedImage,
        pixCopyPaste: pixData.payload,
        status: data.status,
      };
    }
  }

  return {
    id: data.id,
    status: data.status,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { beneficiario_id, metodo } = await request.json();

    if (!beneficiario_id || !metodo) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (!['pix', 'cartao_credito'].includes(metodo)) {
      return NextResponse.json(
        { message: 'Método de pagamento inválido' },
        { status: 400 }
      );
    }

    const { data: beneficiario, error: benError } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, responsavel_id, nome_completo')
      .eq('id', beneficiario_id)
      .single();

    if (benError || !beneficiario) {
      return NextResponse.json(
        { message: 'Beneficiário não encontrado' },
        { status: 404 }
      );
    }

    const valor = 99.90;

    const cobranca = await criarCobrancaAsaas(beneficiario_id, valor, metodo as 'pix' | 'cartao_credito');

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        beneficiario_id,
        responsavel_id: beneficiario.responsavel_id,
        gateway: 'asaas',
        gateway_id: cobranca.id,
        metodo,
        valor,
        status: 'pendente',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Erro ao salvar pagamento:', paymentError);
      return NextResponse.json(
        { message: 'Erro ao criar registro de pagamento' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        pagamento_id: payment.id,
        gateway_id: cobranca.id,
        pixQrCode: cobranca.pixQrCode || null,
        pixCopyPaste: cobranca.pixCopyPaste || null,
        status: 'pendente',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
