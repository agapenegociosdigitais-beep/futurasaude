import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
        message: 'Login bem-sucedido'
      },
      { status: 200 }
    );

    // TODO security: refatorar HTML estatico para usar cookie auth via /api/auth/session
    // e tornar tokens httpOnly (mitigacao XSS).
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 3600,
      path: '/'
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 86400 * 30,
      path: '/'
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Erro interno: ' + error.message },
      { status: 500 }
    );
  }
}
