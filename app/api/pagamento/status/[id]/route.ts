import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const { data: pagamento, error } = await supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id, responsavel_id, status, valor, metodo, pago_em')
      .eq('id', id)
      .single();

    if (error || !pagamento) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 });
    }

    if (pagamento.responsavel_id !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({
      status: pagamento.status,
      pagamento_id: pagamento.id,
      valor: pagamento.valor,
      metodo: pagamento.metodo,
      pago_em: pagamento.pago_em,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
