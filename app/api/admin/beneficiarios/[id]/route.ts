import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { id } = await Promise.resolve(params);
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('beneficiarios')
      .update({ status })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao atualizar status' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Status atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
