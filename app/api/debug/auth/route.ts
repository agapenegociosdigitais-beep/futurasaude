import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Obter sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('DEBUG - Session:', session);
    console.log('DEBUG - Session Error:', sessionError);

    if (!session) {
      return NextResponse.json({
        logado: false,
        mensagem: 'Nenhuma sessão encontrada',
        cookies: request.headers.get('cookie')
      });
    }

    // Obter perfil
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    console.log('DEBUG - Perfil:', perfil);
    console.log('DEBUG - Perfil Error:', perfilError);

    return NextResponse.json({
      logado: true,
      usuario: {
        id: session.user.id,
        email: session.user.email
      },
      perfil: perfil,
      perfilError: perfilError?.message,
      sessaoCompleta: session
    });
  } catch (error: any) {
    console.error('DEBUG - Erro:', error);
    return NextResponse.json({
      erro: true,
      mensagem: error.message
    });
  }
}
