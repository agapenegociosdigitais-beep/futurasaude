import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_FIELDS = ['nome', 'icone', 'ativa'];

function sanitize(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) clean[key] = body[key];
  }
  return clean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const clean = sanitize(body);

    if (Object.keys(clean).length === 0) {
      return NextResponse.json(
        { message: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      );
    }

    if (clean.nome !== undefined && !String(clean.nome).trim()) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('especialidades')
      .update(clean)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao atualizar especialidade' },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);

    const { error } = await supabaseAdmin
      .from('especialidades')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao deletar especialidade' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Especialidade deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
