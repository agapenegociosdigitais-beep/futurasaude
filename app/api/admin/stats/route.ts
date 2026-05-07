import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { count: totalBeneficiarios } = await supabaseAdmin
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true });

    const { count: ativos } = await supabaseAdmin
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');

    const { count: pendentes } = await supabaseAdmin
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente');

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: pagamentos } = await supabaseAdmin
      .from('pagamentos')
      .select('valor')
      .eq('status', 'pago')
      .gte('pago_em', firstDay);

    const receitaMes = pagamentos?.reduce((sum, p) => sum + parseFloat(p.valor), 0) || 0;

    return NextResponse.json({
      totalBeneficiarios: totalBeneficiarios || 0,
      ativos: ativos || 0,
      pendentes: pendentes || 0,
      receitaMes,
    });
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
