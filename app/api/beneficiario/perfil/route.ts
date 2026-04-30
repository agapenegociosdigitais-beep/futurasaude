import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    // Buscar perfil do responsável
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    // Buscar beneficiário vinculado
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
