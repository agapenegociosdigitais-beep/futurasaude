import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  avaliarPlano,
  getAuthUserFromRequest,
  getBeneficiarioByUserId,
  getValidadeAutorizacao,
  TIPOS_AUTORIZACAO,
  unauthorizedResponse,
} from '@/lib/autorizacoes';

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const beneficiario = await getBeneficiarioByUserId(user.id);
    if (!beneficiario) return NextResponse.json([], { status: 200 });

    const { data, error } = await supabaseAdmin
      .from('autorizacoes')
      .select('*')
      .eq('beneficiario_id', beneficiario.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar autorizações' }, { status: 400 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const beneficiario = await getBeneficiarioByUserId(user.id);
    if (!beneficiario) {
      return NextResponse.json({ message: 'Beneficiário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const tipo = String(body?.tipo || '').trim().toLowerCase();
    const especialidadeOuExame = String(body?.especialidade_ou_exame || '').trim();
    const justificativa = String(body?.justificativa || '').trim() || null;

    if (!TIPOS_AUTORIZACAO.includes(tipo as any)) {
      return NextResponse.json({ message: 'Tipo de autorização inválido' }, { status: 400 });
    }

    if (!especialidadeOuExame) {
      return NextResponse.json({ message: 'Especialidade ou exame é obrigatório' }, { status: 400 });
    }

    const avaliacao = avaliarPlano(beneficiario);

    const { data, error } = await supabaseAdmin
      .from('autorizacoes')
      .insert({
        beneficiario_id: beneficiario.id,
        tipo,
        especialidade_ou_exame: especialidadeOuExame,
        justificativa,
        status: avaliacao.status,
        motivo_negativa: avaliacao.motivo_negativa,
        valida_ate: getValidadeAutorizacao(),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ message: 'Erro ao criar autorização', detail: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
