import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const TIPOS_AUTORIZACAO = ['consulta', 'exame', 'procedimento'] as const;
export type TipoAutorizacao = (typeof TIPOS_AUTORIZACAO)[number];

export async function getAuthUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('sb-access-token='))
    ?.split('=')[1];

  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') || tokenFromCookie;

  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

export async function getBeneficiarioByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('beneficiarios')
    .select('id, nome_completo, cpf, status, plano_inicio, plano_fim, responsavel_id')
    .eq('responsavel_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error('Erro ao buscar beneficiário');
  }

  return data;
}

export function avaliarPlano(beneficiario: {
  status: string | null;
  plano_inicio: string | null;
  plano_fim: string | null;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (beneficiario.status !== 'ativo') {
    return {
      status: 'negada' as const,
      motivo_negativa: 'Plano inativo',
    };
  }

  if (!beneficiario.plano_inicio) {
    return {
      status: 'negada' as const,
      motivo_negativa: 'Plano ainda não iniciou',
    };
  }

  const inicio = new Date(`${beneficiario.plano_inicio}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || inicio > hoje) {
    return {
      status: 'negada' as const,
      motivo_negativa: 'Plano ainda não iniciou',
    };
  }

  if (!beneficiario.plano_fim) {
    return {
      status: 'negada' as const,
      motivo_negativa: 'Plano sem vigência final configurada',
    };
  }

  const fim = new Date(`${beneficiario.plano_fim}T23:59:59`);
  if (Number.isNaN(fim.getTime()) || fim < hoje) {
    return {
      status: 'negada' as const,
      motivo_negativa: `Plano vencido em ${new Date(`${beneficiario.plano_fim}T00:00:00`).toLocaleDateString('pt-BR')}`,
    };
  }

  return {
    status: 'aprovada' as const,
    motivo_negativa: null,
  };
}

export function getValidadeAutorizacao() {
  const validade = new Date();
  validade.setDate(validade.getDate() + 30);
  return validade.toISOString();
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
}
