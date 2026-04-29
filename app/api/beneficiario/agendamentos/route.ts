import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const { beneficiario_id, clinica_id, especialidade_id } = body;

    if (!beneficiario_id || !clinica_id || !especialidade_id) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: 'Erro ao criar agendamento' },
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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const beneficiario_id = searchParams.get('beneficiario_id');

    if (!token || !beneficiario_id) {
      return NextResponse.json(
        { message: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('agendamentos')
      .select('*')
      .eq('beneficiario_id', beneficiario_id);

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar agendamentos' },
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
