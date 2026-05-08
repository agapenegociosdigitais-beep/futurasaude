import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_KEYS = [
  'nome_empresa', 'cnpj', 'email', 'telefone', 'whatsapp',
  'endereco', 'valor_mensalidade',
  'whatsapp_notificacao', 'email_notificacao', 'sms_notificacao',
];

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

    if (!chave || typeof chave !== 'string') {
      return NextResponse.json(
        { message: 'Chave é obrigatória' },
        { status: 400 }
      );
    }

    if (!ALLOWED_KEYS.includes(chave)) {
      return NextResponse.json(
        { message: `Chave inválida: ${chave}` },
        { status: 400 }
      );
    }

    if (valor === undefined || valor === null) {
      return NextResponse.json(
        { message: 'Valor é obrigatório' },
        { status: 400 }
      );
    }

    if (chave === 'valor_mensalidade') {
      const num = parseFloat(String(valor));
      if (isNaN(num) || num < 0) {
        return NextResponse.json(
          { message: 'Valor da mensalidade deve ser um número positivo' },
          { status: 400 }
        );
      }
    }

    const { error } = await supabaseAdmin
      .from('configuracoes')
      .upsert(
        { chave, valor: String(valor), atualizado_em: new Date().toISOString() },
        { onConflict: 'chave' }
      );

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
