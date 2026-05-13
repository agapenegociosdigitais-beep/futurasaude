import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');
    const filtroCidade = searchParams.get('filtro_cidade');
    const statusFiltro = searchParams.get('status');
    const limitParam = Number(searchParams.get('limit') || '200');
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 500)
      : 200;

    let query = supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id, gateway_id, valor, status, metodo, pago_em, created_at, beneficiarios(nome_completo, cidade)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFiltro && statusFiltro !== 'todos') {
      query = query.eq('status', statusFiltro);
    }

    if (dataInicio || dataFim) {
      const campoData = statusFiltro === 'pago' ? 'pago_em' : 'created_at';
      if (dataInicio) query = query.gte(campoData, `${dataInicio}T00:00:00`);
      if (dataFim) query = query.lte(campoData, `${dataFim}T23:59:59`);
    }

    let { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar pagamentos' }, { status: 400 });
    }

    if (filtroCidade && data) {
      const cidadeFiltroNormalizada = filtroCidade.trim().toLowerCase();
      data = data.filter((p: any) => p.beneficiarios?.cidade?.trim().toLowerCase() === cidadeFiltroNormalizada);
    }

    const pagamentos = Array.isArray(data) ? data : [];
    const totalPago = pagamentos
      .filter((p: any) => p.status === 'pago')
      .reduce((sum: number, p: any) => sum + (parseFloat(String(p.valor)) || 0), 0);
    const totalPendente = pagamentos
      .filter((p: any) => p.status === 'pendente')
      .reduce((sum: number, p: any) => sum + (parseFloat(String(p.valor)) || 0), 0);

    return NextResponse.json(
      { pagamentos, total: totalPago, totalPendente, quantidade: pagamentos.length, limit },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}
