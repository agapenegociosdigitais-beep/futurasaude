import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get('cidade');
    const especialidade = searchParams.get('especialidade');

    let query = supabaseAdmin
      .from('clinicas')
      .select('*, especialidades(nome, icone_emoji)')
      .eq('ativo', true);

    if (cidade) query = query.eq('cidade', cidade);
    if (especialidade) {
      const { data: esp } = await supabaseAdmin
        .from('especialidades')
        .select('id')
        .eq('nome', especialidade)
        .single();

      if (esp) {
        query = query.eq('especialidade_id', esp.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar clinicas' }, { status: 400 });
    }

    const mapped = (data || []).map((c: any) => ({
      id: c.id,
      nome_clinica: c.nome_clinica,
      nome_profissional: c.nome_profissional,
      especialidade_nome: c.especialidades?.nome || '',
      especialidade_icone: c.especialidades?.icone_emoji || '🏥',
      foto_url: c.foto_url,
      endereco: c.endereco,
      bairro: c.bairro,
      cidade: c.cidade,
      whatsapp: c.whatsapp,
      horario: c.horario,
      avaliacao: c.avaliacao,
      google_maps_url: c.google_maps_url,
      website: c.website,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
