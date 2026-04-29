import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session }, error } = await supabase.auth.getSession();

    console.log('Session check:', { session: !!session, error });

    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado', logado: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { session, logado: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { message: 'Erro ao verificar sessão' },
      { status: 500 }
    );
  }
}
