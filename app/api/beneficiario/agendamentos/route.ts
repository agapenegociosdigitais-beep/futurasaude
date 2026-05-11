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

async function getBeneficiarioId(userId: string, requested?: string | null) {
  if (requested) {
    const { data } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, responsavel_id, status')
      .eq('id', requested)
      .maybeSingle();
    if (!data || data.responsavel_id !== userId) return null;
    return data;
  }

  const { data } = await supabaseAdmin
    .from('beneficiarios')
    .select('id, responsavel_id, status')
    .eq('responsavel_id', userId)
    .maybeSingle();
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { clinica_id, especialidade_id } = body;
    const beneficiario_id = body.beneficiario_id;

    if (!clinica_id || !especialidade_id) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    const beneficiario = await getBeneficiarioId(user.id, beneficiario_id);
    if (!beneficiario) {
      return NextResponse.json({ message: 'Beneficiario nao encontrado' }, { status: 404 });
    }

    if (beneficiario.status !== 'ativo') {
      return NextResponse.json({ message: 'Plano nao esta ativo' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('agendamentos')
      .insert({
        beneficiario_id: beneficiario.id,
        clinica_id,
        especialidade_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao criar agendamento' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const beneficiario = await getBeneficiarioId(user.id, searchParams.get('beneficiario_id'));

    if (!beneficiario) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('agendamentos')
      .select(
        '*, clinicas(nome_clinica, endereco, whatsapp), especialidades(nome, icone_emoji)'
      )
      .eq('beneficiario_id', beneficiario.id)
      .order('data_hora', { ascending: true });

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar agendamentos' }, { status: 400 });
    }

    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      data_hora: a.data_hora,
      status: a.status,
      observacao: a.observacao,
      clinica_nome: a.clinicas?.nome_clinica || '',
      clinica_endereco: a.clinicas?.endereco || '',
      clinica_whatsapp: a.clinicas?.whatsapp || '',
      especialidade_nome: a.especialidades?.nome || '',
      especialidade_icone: a.especialidades?.icone_emoji || '',
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'id obrigatorio' }, { status: 400 });
    }

    const { data: ag } = await supabaseAdmin
      .from('agendamentos')
      .select('id, beneficiario_id, beneficiarios(responsavel_id)')
      .eq('id', id)
      .maybeSingle();

    if (!ag) {
      return NextResponse.json({ message: 'Agendamento nao encontrado' }, { status: 404 });
    }

    const responsavelId = (ag as any).beneficiarios?.responsavel_id;
    if (responsavelId !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('agendamentos')
      .update({ status: 'cancelado' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ message: 'Erro ao cancelar' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Cancelado' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
