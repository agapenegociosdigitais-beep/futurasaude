import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { mensagem, filtro_status, filtro_cidade } = body;

    if (!mensagem) {
      return NextResponse.json(
        { message: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Obter beneficiários para enviar mensagens
    let query = supabaseAdmin.from('beneficiarios').select('id, whatsapp, nome_completo');

    if (filtro_status) query = query.eq('status', filtro_status);

    const { data: beneficiarios, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar beneficiários' },
        { status: 400 }
      );
    }

    // Simular envio via Z-API ou similar
    const enviadas = beneficiarios?.length || 0;

    return NextResponse.json(
      {
        message: `${enviadas} mensagens enfileiradas para envio`,
        total_enviadas: enviadas,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
