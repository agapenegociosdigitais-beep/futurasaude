import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

export interface AuthFailure {
  ok: false;
  response: NextResponse;
  userId?: undefined;
  email?: undefined;
}
export interface AuthSuccess {
  ok: true;
  userId: string;
  email: string | undefined;
  response?: undefined;
}
export type AuthResult = AuthFailure | AuthSuccess;

export function isAuthFailure(result: AuthResult): result is AuthFailure {
  return result.ok === false;
}

function unauthorized(message: string): AuthFailure {
  return {
    ok: false as const,
    response: NextResponse.json({ message }, { status: 401 }),
  };
}

function forbidden(message: string): AuthFailure {
  return {
    ok: false as const,
    response: NextResponse.json({ message }, { status: 403 }),
  };
}

function success(userId: string, email: string | undefined): AuthSuccess {
  return { ok: true as const, userId, email };
}

export function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function requireUser(request: NextRequest): Promise<AuthResult> {
  const token = getBearerToken(request);
  if (!token) return unauthorized('Token não fornecido');

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return unauthorized('Token inválido');

  return success(data.user.id, data.user.email);
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const userResult = await requireUser(request);
  if (!userResult.ok) return userResult;

  const { data: perfil, error } = await supabaseAdmin
    .from('perfis')
    .select('tipo')
    .eq('id', userResult.userId)
    .single();

  if (error || !perfil) return forbidden('Perfil não encontrado');
  if (perfil.tipo !== 'admin') return forbidden('Acesso restrito a administradores');

  return userResult;
}
