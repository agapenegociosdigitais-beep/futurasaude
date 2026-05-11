import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const PUBLIC_KEYS = ['whatsapp', 'telefone', 'nome_empresa', 'endereco'];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuracoes')
      .select('chave, valor')
      .in('chave', PUBLIC_KEYS);

    if (error) {
      return NextResponse.json({}, { status: 200 });
    }

    const result: Record<string, string> = {};
    for (const row of data || []) {
      result[row.chave] = row.valor;
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
