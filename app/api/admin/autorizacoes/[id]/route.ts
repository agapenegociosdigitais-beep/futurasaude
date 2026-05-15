import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const STATUSS_ADMIN = ['cancelada', 'utilizada'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request as any);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const status = String(body?.status || '').trim().toLowerCase();

    if (!STATUSS_ADMIN.includes(status)) {
      return NextResponse.json({ message: 'Status inválido para ação administrativa' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('autorizacoes')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao atualizar autorização', detail: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
