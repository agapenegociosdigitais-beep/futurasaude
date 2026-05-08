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

    let query = supabaseAdmin
      .from('pagamentos')
      .select('*')
      .eq('status', 'pago');

    if (dataInicio) query = query.gte('pago_em', dataInicio);
    if (dataFim) query = query.lte('pago_em', dataFim);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar pagamentos' },
        { status: 400 }
      );
    }

    const total = data?.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0) || 0;

    return NextResponse.json(
      { pagamentos: data, total, quantidade: data?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
