import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get('cidade');
    const especialidade = searchParams.get('especialidade');

    let query = supabaseAdmin.from('clinicas').select('*').eq('ativo', true);

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
      return NextResponse.json(
        { message: 'Erro ao buscar clínicas' },
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
