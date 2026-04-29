import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { num_ganhadores, premio } = body;

    // Obter beneficiários ativos
    const { data: beneficiarios, error: benefError } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, nome_completo')
      .eq('status', 'ativo')
      .eq('sorteio_participa', true);

    if (benefError || !beneficiarios || beneficiarios.length === 0) {
      return NextResponse.json(
        { message: 'Sem beneficiários ativos para sortear' },
        { status: 400 }
      );
    }

    // Sortear ganhadores
    const ganhadores = [];
    const indexesSorteados = new Set();

    while (ganhadores.length < Math.min(num_ganhadores, beneficiarios.length)) {
      const index = Math.floor(Math.random() * beneficiarios.length);
      if (!indexesSorteados.has(index)) {
        indexesSorteados.add(index);
        ganhadores.push(beneficiarios[index]);
      }
    }

    // Criar hash de auditoria
    const hashInput = JSON.stringify(ganhadores) + Date.now();
    const hashAuditoria = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex');

    // Registrar sorteio
    const { data: sorteio, error: sorteioError } = await supabaseAdmin
      .from('sorteios')
      .insert({
        realizado_por: auth.userId,
        total_participantes: beneficiarios.length,
        ganhadores: ganhadores.map((g) => ({
          id: g.id,
          nome: g.nome_completo,
          premio,
        })),
        hash_auditoria: hashAuditoria,
      })
      .select()
      .single();

    if (sorteioError) {
      return NextResponse.json(
        { message: 'Erro ao registrar sorteio' },
        { status: 400 }
      );
    }

    return NextResponse.json(sorteio, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { data, error } = await supabaseAdmin
      .from('sorteios')
      .select('*')
      .order('realizado_em', { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar sorteios' },
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
