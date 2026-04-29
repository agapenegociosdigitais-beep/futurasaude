import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({
        logado: false,
        mensagem: 'Nenhuma sessão encontrada',
      });
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      logado: true,
      usuario: {
        id: session.user.id,
        email: session.user.email,
      },
      perfil,
      perfilError: perfilError?.message,
      sessionError: sessionError?.message,
    });
  } catch (error: any) {
    return NextResponse.json({
      erro: true,
      mensagem: error.message,
    });
  }
}
