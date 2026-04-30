import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { pagamento_id } = await request.json();

    if (!pagamento_id) {
      return NextResponse.json(
        { message: 'ID do pagamento é obrigatório' },
        { status: 400 }
      );
    }

    const { data: pagamento, error: findError } = await supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id, gateway_id')
      .eq('id', pagamento_id)
      .single();

    if (findError || !pagamento) {
      return NextResponse.json(
        { message: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    const { error: paymentError } = await supabaseAdmin
      .from('pagamentos')
      .update({
        status: 'pago',
        pago_em: new Date().toISOString(),
      })
      .eq('id', pagamento_id);

    if (paymentError) {
      return NextResponse.json(
        { message: 'Erro ao atualizar pagamento' },
        { status: 400 }
      );
    }

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
      .eq('id', pagamento.beneficiario_id);

    if (benefError) {
      return NextResponse.json(
        { message: 'Erro ao ativar beneficiário' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Pagamento simulado com sucesso', status: 'pago' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao simular pagamento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
