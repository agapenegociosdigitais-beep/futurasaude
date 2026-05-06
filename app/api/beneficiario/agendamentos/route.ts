import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { beneficiario_id, clinica_id, especialidade_id } = await request.json();

    if (!beneficiario_id || !clinica_id || !especialidade_id) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    const { data: beneficiario, error: benError } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, responsavel_id, status')
      .eq('id', beneficiario_id)
      .single();

    if (benError || !beneficiario) {
      return NextResponse.json({ message: 'Beneficiário não encontrado' }, { status: 404 });
    }

    if (beneficiario.responsavel_id !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    if (beneficiario.status !== 'ativo') {
      return NextResponse.json({ message: 'Plano não está ativo' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('agendamentos')
      .insert({
        beneficiario_id,
        clinica_id,
        especialidade_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao criar agendamento' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const beneficiario_id = searchParams.get('beneficiario_id');

    if (!beneficiario_id) {
      return NextResponse.json({ message: 'beneficiario_id é obrigatório' }, { status: 400 });
    }

    const { data: beneficiario, error: benError } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, responsavel_id')
      .eq('id', beneficiario_id)
      .single();

    if (benError || !beneficiario) {
      return NextResponse.json({ message: 'Beneficiário não encontrado' }, { status: 404 });
    }

    if (beneficiario.responsavel_id !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('agendamentos')
      .select('*')
      .eq('beneficiario_id', beneficiario_id);

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar agendamentos' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
