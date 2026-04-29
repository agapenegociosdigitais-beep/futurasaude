import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Obter beneficiários com geolocalização
    const { data, error } = await supabaseAdmin
      .from('perfis')
      .select('cidade, bairro, lat, lng')
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar dados de localização' },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
