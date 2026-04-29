import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

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

    const total = data?.reduce((sum, p) => sum + parseFloat(p.valor), 0) || 0;

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
