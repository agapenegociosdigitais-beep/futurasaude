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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { data, error } = await supabaseAdmin
      .from('especialidades')
      .select('*');

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar especialidades' },
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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const clean = sanitize(body);

    if (!clean.nome || !String(clean.nome).trim()) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (clean.ativa === undefined) clean.ativa = true;

    const { data, error } = await supabaseAdmin
      .from('especialidades')
      .insert(clean)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao criar especialidade' },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
