import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const VALID_STATUSES = ['ativo', 'pendente', 'inativo'];
const ALLOWED_FIELDS_PATCH = ['status'];
const ALLOWED_FIELDS_PUT = ['nome_completo', 'cpf', 'email', 'telefone', 'status'];

function sanitize(body: Record<string, unknown>, allowed: string[]) {
  const clean: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) clean[key] = body[key];
  }
  return clean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const clean = sanitize(body, ALLOWED_FIELDS_PATCH);

    if (!clean.status) {
      return NextResponse.json(
        { message: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(String(clean.status))) {
      return NextResponse.json(
        { message: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiarios')
      .update({ status: clean.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao atualizar status' },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const clean = sanitize(body, ALLOWED_FIELDS_PUT);

    if (Object.keys(clean).length === 0) {
      return NextResponse.json(
        { message: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      );
    }

    if (clean.status && !VALID_STATUSES.includes(String(clean.status))) {
      return NextResponse.json(
        { message: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiarios')
      .update(clean)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao atualizar beneficiário' },
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
      .from('beneficiarios')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao deletar beneficiário' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Beneficiário deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
