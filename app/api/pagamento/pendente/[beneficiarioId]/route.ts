import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ beneficiarioId: string }> }
) {
  try {
    const { beneficiarioId } = await params;
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const { data: pagamento } = await supabaseAdmin
      .from('pagamentos')
      .select('id, status, gateway_id')
      .eq('beneficiario_id', beneficiarioId)
      .eq('responsavel_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pagamento) {
      return NextResponse.json({ pagamento_id: null }, { status: 200 });
    }

    return NextResponse.json({
      pagamento_id: pagamento.id,
      status: pagamento.status,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ pagamento_id: null }, { status: 200 });
  }
}
