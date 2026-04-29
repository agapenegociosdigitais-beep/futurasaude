import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Sempre liberar estáticos e API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return response;
  }

  // Pegar token do cookie
  const accessToken = request.cookies.get('sb-access-token')?.value;

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/cadastro', '/pagamento'];
  if (publicRoutes.includes(pathname)) {
    if (accessToken && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Proteger /dashboard e /admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        const redirect = NextResponse.redirect(new URL('/login', request.url));
        redirect.cookies.delete('sb-access-token');
        redirect.cookies.delete('sb-refresh-token');
        return redirect;
      }

      if (pathname.startsWith('/admin')) {
        const { data: perfil } = await supabase
          .from('perfis').select('tipo').eq('id', user.id).single();
        if (perfil?.tipo !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }

      return response;
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
