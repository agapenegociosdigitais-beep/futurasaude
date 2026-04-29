import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('configuracoes')
      .select('*');

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar configurações' },
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

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const { chave, valor } = body;

    if (!chave || !valor) {
      return NextResponse.json(
        { message: 'Chave e valor são obrigatórios' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('configuracoes')
      .upsert({ chave, valor, atualizado_em: new Date().toISOString() });

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao salvar configuração' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Configuração salva com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
