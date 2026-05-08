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
      return NextResponse.json({ message: 'Mensagem e obrigatoria' }, { status: 400 });
    }

    let query = supabaseAdmin.from('beneficiarios').select('id, whatsapp, nome_completo');

    if (filtro_status) query = query.eq('status', filtro_status);
    if (filtro_cidade) query = query.eq('cidade', filtro_cidade);

    const { data: beneficiarios, error } = await query;

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar beneficiarios' }, { status: 400 });
    }

    // PLACEHOLDER: integracao real com Z-API/WhatsApp API pendente
    // A implementacao abaixo apenas simula o envio.
    // Para producao, conectar com provedor WhatsApp (Z-API, Evolution API, etc.)
    const enviadas = beneficiarios?.length || 0;

    console.warn('[MENSAGEM MASSA] Modo simulacao - nenhuma mensagem real enviada.');
    console.warn('[MENSAGEM MASSA] Para producao, integrar com provedor WhatsApp.');

    return NextResponse.json(
      {
        message: `${enviadas} mensagens simuladas (integracao WhatsApp pendente)`,
        total_enviadas: enviadas,
        modo: 'SIMULACAO',
        aviso: 'Nenhuma mensagem real foi enviada. Configure provedor WhatsApp para producao.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
