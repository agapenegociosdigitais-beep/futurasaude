import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const [
      { count: ativos },
      { count: total },
      { count: agendamentosPendentes },
      pagamentosDiaResult,
    ] = await Promise.all([
      supabaseAdmin.from('beneficiarios').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabaseAdmin.from('beneficiarios').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('agendamentos').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabaseAdmin
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pago')
        .gte('pago_em', `${new Date().toISOString().split('T')[0]}T00:00:00`),
    ]);

    const totalPagamentosDia = pagamentosDiaResult.data?.reduce(
      (sum, p) => sum + parseFloat(p.valor), 0
    ) || 0;

    const taxaAtivacao = total && total > 0
      ? Math.round(((ativos || 0) / total) * 1000) / 10
      : 0;

    return NextResponse.json(
      {
        total_beneficiarios: ativos || 0,
        pagamentos_dia: totalPagamentosDia,
        taxa_ativacao: taxaAtivacao,
        agendamentos_pendentes: agendamentosPendentes || 0,
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
