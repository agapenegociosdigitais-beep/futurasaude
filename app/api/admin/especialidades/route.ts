import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_FIELDS = [
  'nome',
  'icone_emoji',
  'icone_url',
  'tipo_beneficio',
  'descricao_beneficio',
  'visivel_beneficiario',
  'ativo',
];

const TIPOS_VALIDOS = ['gratuito', 'desconto', 'avaliacao'];

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
      .select('*')
      .order('nome');

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar especialidades', detail: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
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

    clean.icone_emoji = clean.icone_emoji ? String(clean.icone_emoji).trim() : '';

    if (!clean.tipo_beneficio || !TIPOS_VALIDOS.includes(String(clean.tipo_beneficio))) {
      clean.tipo_beneficio = 'desconto';
    }

    if (!clean.descricao_beneficio || !String(clean.descricao_beneficio).trim()) {
      clean.descricao_beneficio = 'Benefício exclusivo Futura Saúde';
    }

    if (clean.ativo === undefined) clean.ativo = true;
    if (clean.visivel_beneficiario === undefined) clean.visivel_beneficiario = true;

    clean.nome = String(clean.nome).trim();

    const { data: dup } = await supabaseAdmin
      .from('especialidades')
      .select('id')
      .ilike('nome', String(clean.nome))
      .maybeSingle();

    if (dup) {
      return NextResponse.json(
        { message: 'Especialidade com esse nome já existe' },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('especialidades')
      .insert(clean)
      .select()
      .single();

    if (error) {
      console.error('Erro criar especialidade:', error);
      return NextResponse.json(
        { message: 'Erro ao criar especialidade', detail: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Erro interno especialidades POST:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
