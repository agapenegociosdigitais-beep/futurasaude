import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    // Contar beneficiários ativos
    const { count: beneficiarios } = await supabaseAdmin
      .from('beneficiarios')
      .select('*', { count: 'exact' })
      .eq('status', 'ativo');

    // Contar pagamentos do dia
    const today = new Date().toISOString().split('T')[0];
    const { data: pagamentosDia } = await supabaseAdmin
      .from('pagamentos')
      .select('valor')
      .eq('status', 'pago')
      .gte('pago_em', `${today}T00:00:00`);

    const totalPagamentosDia = pagamentosDia?.reduce(
      (sum, p) => sum + parseFloat(p.valor),
      0
    ) || 0;

    return NextResponse.json(
      {
        total_beneficiarios: beneficiarios || 0,
        pagamentos_dia: totalPagamentosDia,
        taxa_ativacao: 94.2,
        agendamentos_pendentes: 43,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
