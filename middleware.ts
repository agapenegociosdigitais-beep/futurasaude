import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/cadastro', '/pagamento', '/admin/login'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isStaticOrApi(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticOrApi(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  if (isPublicRoute(pathname)) {
    if (accessToken && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (accessToken && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = pathname.startsWith('/admin')
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[MW] Variáveis Supabase ausentes');
      const loginUrl = pathname.startsWith('/admin')
        ? new URL('/admin/login', request.url)
        : new URL('/login', request.url);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.cookies.delete('sb-access-token');
      redirect.cookies.delete('sb-refresh-token');
      return redirect;
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('[MW] Token inválido:', error?.message);

      if (refreshToken) {
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });

          if (!refreshError && refreshData.session) {
            const redirect = NextResponse.redirect(new URL(pathname, request.url));
            redirect.cookies.set('sb-access-token', refreshData.session.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 3600,
              path: '/',
            });
            redirect.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 604800,
              path: '/',
            });
            return redirect;
          }
        } catch (refreshErr) {
          console.error('[MW] Refresh falhou:', refreshErr);
        }
      }

      const loginUrl = pathname.startsWith('/admin')
        ? new URL('/admin/login', request.url)
        : new URL('/login', request.url);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.cookies.delete('sb-access-token');
      redirect.cookies.delete('sb-refresh-token');
      return redirect;
    }

    if (pathname.startsWith('/admin')) {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('id', user.id)
        .single();

      if (perfilError) {
        console.error('[MW] Erro ao buscar perfil:', perfilError.message);
        const redirect = NextResponse.redirect(new URL('/admin/login', request.url));
        redirect.cookies.delete('sb-access-token');
        redirect.cookies.delete('sb-refresh-token');
        return redirect;
      }

      if (perfil?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('[MW] Erro inesperado:', err);
    const loginUrl = pathname.startsWith('/admin')
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete('sb-access-token');
    redirect.cookies.delete('sb-refresh-token');
    return redirect;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
