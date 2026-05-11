import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getAuthUser(request: NextRequest) {
  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.cookies.get('sb-access-token')?.value;
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { data: beneficiario } = await supabaseAdmin
      .from('beneficiarios')
      .select('*')
      .eq('responsavel_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      perfil,
      beneficiario,
    });
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

const ALLOWED = ['nome_completo', 'whatsapp'];

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};
    if ('escola' in body) update.escola = String(body.escola ?? '').trim();
    if ('cidade' in body) update.cidade = String(body.cidade ?? '').trim();

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: 'Nenhum campo valido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('beneficiarios')
      .update(update)
      .eq('responsavel_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar dados do beneficiario' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

const ALLOWED_PERFIL = ['nome_completo', 'whatsapp'];

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};
    for (const k of ALLOWED_PERFIL) {
      if (k in body) update[k] = body[k];
    }

    if (typeof update.nome_completo === 'string') {
      update.nome_completo = (update.nome_completo as string).trim();
      if (!update.nome_completo) {
        return NextResponse.json({ message: 'Nome nao pode ser vazio' }, { status: 400 });
      }
    }
    if (typeof update.whatsapp === 'string') {
      update.whatsapp = (update.whatsapp as string).replace(/\D/g, '');
    }
    if (typeof update.cep === 'string') {
      update.cep = (update.cep as string).replace(/\D/g, '');
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: 'Nenhum campo valido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('perfis')
      .update(update)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar perfil' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
