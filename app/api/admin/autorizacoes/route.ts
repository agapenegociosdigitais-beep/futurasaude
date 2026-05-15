import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as any);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tipo = searchParams.get('tipo');
    const busca = searchParams.get('busca')?.trim();

    let query = supabaseAdmin
      .from('autorizacoes')
      .select('*, beneficiarios(nome_completo, cpf)')
      .order('created_at', { ascending: false });

    if (status && status !== 'todos') query = query.eq('status', status);
    if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo);
    if (busca) query = query.or(`protocolo.ilike.%${busca}%,especialidade_ou_exame.ilike.%${busca}%`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar autorizações' }, { status: 400 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
