import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

function getApiKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY não configurada');
  }
  return apiKey;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const name = new URL(request.url).searchParams.get('name')?.trim();

    if (!name) {
      return NextResponse.json({ message: 'Parâmetro name é obrigatório' }, { status: 400 });
    }

    const apiKey = getApiKey();
    const photoUrl = new URL(`https://places.googleapis.com/v1/${name}/media`);
    photoUrl.searchParams.set('maxWidthPx', '512');
    photoUrl.searchParams.set('skipHttpRedirect', 'true');
    photoUrl.searchParams.set('key', apiKey);

    const response = await fetch(photoUrl.toString(), { cache: 'no-store' });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json({ message: `Erro ao buscar foto do Google: ${message}` }, { status: 400 });
    }

    const data = await response.json();
    const mediaUrl = typeof data?.photoUri === 'string' ? data.photoUri.trim() : '';

    if (!mediaUrl) {
      return NextResponse.json({ message: 'Foto do Google indisponível para este local' }, { status: 404 });
    }

    return NextResponse.redirect(mediaUrl, { status: 307 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Erro ao buscar foto do Google' },
      { status: 500 }
    );
  }
}
