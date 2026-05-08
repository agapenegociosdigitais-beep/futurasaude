import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: beneficiario } = await supabaseAdmin
      .from('beneficiarios')
      .select('*')
      .eq('responsavel_id', user.id)
      .single();

    return NextResponse.json({
      perfil,
      beneficiario,
      message: 'Dados carregados com sucesso'
    });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
