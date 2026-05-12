import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { data, error } = await supabaseAdmin
      .from('clinicas')
      .select('*, especialidades(nome, icone_emoji)');

    if (error) {
      console.error('Erro buscar clínicas:', error);
      return NextResponse.json(
        { message: 'Erro ao buscar clínicas', detail: error.message },
        { status: 400 }
      );
    }

    const mapped = (data || []).map((c: any) => ({
      id: c.id,
      nome_clinica: c.nome_clinica,
      nome_profissional: c.nome_profissional,
      especialidade_id: c.especialidade_id,
      especialidade_nome: c.especialidades?.nome || '',
      especialidade_icone: c.especialidades?.icone_emoji || '',
      registro_profissional: c.registro_profissional,
      foto_url: c.foto_url,
      endereco: c.endereco,
      bairro: c.bairro,
      cidade: c.cidade,
      whatsapp: c.whatsapp,
      horario: c.horario,
      avaliacao: c.avaliacao,
      total_agendamentos: c.total_agendamentos,
      ativo: c.ativo,
      criado_em: c.criado_em,
      google_place_id: c.google_place_id,
      google_maps_url: c.google_maps_url,
      website: c.website,
      latitude: c.latitude,
      longitude: c.longitude,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (error: any) {
    console.error('Erro interno clínicas GET:', error);
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

    if (!body.nome_clinica?.trim()) {
      return NextResponse.json(
        { message: 'Nome da clínica é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.especialidade_id) {
      return NextResponse.json(
        { message: 'Especialidade é obrigatória' },
        { status: 400 }
      );
    }

    if (!body.cidade?.trim()) {
      return NextResponse.json(
        { message: 'Cidade é obrigatória' },
        { status: 400 }
      );
    }

    const insertData = {
      nome_clinica: body.nome_clinica.trim(),
      nome_profissional: body.nome_profissional?.trim() || null,
      especialidade_id: body.especialidade_id,
      registro_profissional: body.registro_profissional?.trim() || null,
      foto_url: body.foto_url || null,
      endereco: body.endereco?.trim() || null,
      bairro: body.bairro?.trim() || null,
      cidade: body.cidade.trim(),
      whatsapp: body.whatsapp?.trim() || null,
      horario: body.horario?.trim() || null,
      ativo: body.ativo !== undefined ? body.ativo : true,
      google_place_id: body.google_place_id?.trim() || null,
      google_maps_url: body.google_maps_url?.trim() || null,
      website: body.website?.trim() || null,
      latitude: typeof body.latitude === 'number' ? body.latitude : null,
      longitude: typeof body.longitude === 'number' ? body.longitude : null,
    };

    const { data, error } = await supabaseAdmin
      .from('clinicas')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Erro criar clínica:', error);
      return NextResponse.json(
        { message: 'Erro ao criar clínica', detail: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Erro interno clínicas POST:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
