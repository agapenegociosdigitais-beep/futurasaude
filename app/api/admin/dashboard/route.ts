import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (perfil?.tipo !== 'admin') {
      return NextResponse.json(
        { message: 'Sem permissão' },
        { status: 403 }
      );
    }

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
