import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

type FinanceiroFilters = {
  statusFiltro: string;
  dataInicio: string | null;
  dataFim: string | null;
};

function aplicarFiltros(query: any, { statusFiltro, dataInicio, dataFim }: FinanceiroFilters) {
  let nextQuery = query;

  if (statusFiltro && statusFiltro !== 'todos') {
    nextQuery = nextQuery.eq('status', statusFiltro);
  }

  if (dataInicio || dataFim) {
    const campoData = statusFiltro === 'pago' ? 'pago_em' : 'criado_em';
    if (dataInicio) nextQuery = nextQuery.gte(campoData, `${dataInicio}T00:00:00`);
    if (dataFim) nextQuery = nextQuery.lte(campoData, `${dataFim}T23:59:59`);
  }

  return nextQuery;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');
    const statusFiltro = searchParams.get('status') || 'todos';

    const filters: FinanceiroFilters = { statusFiltro, dataInicio, dataFim };

    const { data, error } = await aplicarFiltros(
      supabaseAdmin
        .from('pagamentos')
        .select('valor, status'),
      filters
    );

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar métricas do financeiro' }, { status: 400 });
    }

    const pagamentos = Array.isArray(data) ? data : [];
    const quantidadeTotal = pagamentos.length;
    const quantidadePago = pagamentos.filter((p: any) => p.status === 'pago').length;
    const quantidadePendente = pagamentos.filter((p: any) => p.status === 'pendente').length;
    const totalPago = pagamentos
      .filter((p: any) => p.status === 'pago')
      .reduce((sum: number, p: any) => sum + (parseFloat(String(p.valor)) || 0), 0);
    const totalPendente = pagamentos
      .filter((p: any) => p.status === 'pendente')
      .reduce((sum: number, p: any) => sum + (parseFloat(String(p.valor)) || 0), 0);

    return NextResponse.json(
      {
        cards: {
          totalPago,
          totalPendente,
          quantidadeTotal,
          quantidadePago,
          quantidadePendente,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}
