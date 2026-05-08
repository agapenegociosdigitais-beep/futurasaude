import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Token nao fornecido' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const { data: beneficiario, error } = await supabaseAdmin
      .from('beneficiarios')
      .select('*')
      .eq('responsavel_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ message: 'Beneficiario nao encontrado' }, { status: 404 });
    }

    return NextResponse.json(beneficiario, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
