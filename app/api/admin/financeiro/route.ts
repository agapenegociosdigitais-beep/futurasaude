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

    let query = supabaseAdmin
      .from('pagamentos')
      .select('*, beneficiarios(nome_completo, cidade)')
      .order('created_at', { ascending: false });

    if (statusFiltro && statusFiltro !== 'todos') {
      query = query.eq('status', statusFiltro);
    }

    if (dataInicio) query = query.gte('pago_em', dataInicio);
    if (dataFim) query = query.lte('pago_em', dataFim);

    let { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar pagamentos' }, { status: 400 });
    }

    if (filtroCidade && data) {
      data = data.filter((p: any) => p.beneficiarios?.cidade === filtroCidade);
    }

    const totalPago = data?.filter((p: any) => p.status === 'pago')
      .reduce((sum: number, p: any) => sum + (parseFloat(p.valor) || 0), 0) || 0;
    const totalPendente = data?.filter((p: any) => p.status === 'pendente')
      .reduce((sum: number, p: any) => sum + (parseFloat(p.valor) || 0), 0) || 0;

    return NextResponse.json(
      { pagamentos: data, total: totalPago, totalPendente, quantidade: data?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
