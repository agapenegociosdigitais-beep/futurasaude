import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getGooglePlaceDetails, searchGooglePlaces } from '@/lib/google-places';
import { supabaseAdmin } from '@/lib/supabase';

async function getEspecialidadeNome(especialidadeId?: string) {
  if (!especialidadeId) return null;

  const { data } = await supabaseAdmin
    .from('especialidades')
    .select('nome')
    .eq('id', especialidadeId)
    .maybeSingle();

  return data?.nome || null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const mode = body?.mode;

    if (mode === 'search') {
      const query = String(body?.query || '').trim();
      const cidade = String(body?.cidade || '').trim();
      const bairro = String(body?.bairro || '').trim();
      const especialidadeId = String(body?.especialidade_id || '').trim();

      if (query.length < 3) {
        return NextResponse.json(
          { message: 'Informe pelo menos 3 caracteres para buscar' },
          { status: 400 }
        );
      }

      if (!especialidadeId) {
        return NextResponse.json(
          { message: 'Selecione a especialidade' },
          { status: 400 }
        );
      }

      const especialidadeNome = await getEspecialidadeNome(especialidadeId);
      const candidates = await searchGooglePlaces({
        query,
        cidade,
        bairro,
        especialidadeNome: especialidadeNome || undefined,
        maxResultCount: 6,
      });

      return NextResponse.json({ success: true, candidates }, { status: 200 });
    }

    if (mode === 'details') {
      const placeId = String(body?.place_id || '').trim();
      const especialidadeId = String(body?.especialidade_id || '').trim();

      if (!placeId) {
        return NextResponse.json(
          { message: 'Selecione um resultado válido do Google' },
          { status: 400 }
        );
      }

      if (!especialidadeId) {
        return NextResponse.json(
          { message: 'Selecione a especialidade' },
          { status: 400 }
        );
      }

      const data = await getGooglePlaceDetails(placeId);

      return NextResponse.json(
        {
          success: true,
          data: {
            ...data,
            especialidade_id: especialidadeId,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Modo de importação inválido' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro importação Google Places:', error);
    return NextResponse.json(
      {
        message:
          error?.message?.includes('GOOGLE_PLACES_API_KEY')
            ? 'Google Places API não configurada no servidor'
            : 'Erro ao buscar dados no Google. Tente novamente.',
      },
      { status: 500 }
    );
  }
}
