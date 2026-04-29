import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

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
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
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
