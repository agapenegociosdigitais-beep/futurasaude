import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_FIELDS = ['nome_completo', 'cpf', 'email', 'telefone', 'status', 'responsavel_id', 'cidade', 'data_nascimento'];

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin.from('beneficiarios').select('*');
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar beneficiarios' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const clean = sanitize(body);

    if (!clean.nome_completo || !String(clean.nome_completo).trim()) {
      return NextResponse.json({ message: 'Nome completo e obrigatorio' }, { status: 400 });
    }

    if (!clean.cpf || !String(clean.cpf).trim()) {
      return NextResponse.json({ message: 'CPF e obrigatorio' }, { status: 400 });
    }

    if (!clean.responsavel_id) {
      return NextResponse.json({ message: 'responsavel_id e obrigatorio' }, { status: 400 });
    }

    if (clean.ativa === undefined) {
      (clean as any).status = 'pendente';
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiarios')
      .insert(clean)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao criar beneficiario' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
