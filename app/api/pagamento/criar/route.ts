import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { beneficiario_id, metodo, gateway } = await request.json();

    if (!beneficiario_id || !metodo || !gateway) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const valor = 99.90;

    // Simular criação no gateway
    const gatewayId = `${gateway}-${Date.now()}`;

    // Criar registro de pagamento
    const { data: payment, error } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        beneficiario_id,
        responsavel_id: beneficiario_id, // Será preenchido corretamente futuramente
        gateway,
        gateway_id: gatewayId,
        metodo,
        valor,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao criar pagamento' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        pagamento_id: payment.id,
        pixQrCode: 'QR_CODE_AQUI',
        pixCopyPaste: 'PIX_CODE_AQUI',
        gateway_id: gatewayId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
