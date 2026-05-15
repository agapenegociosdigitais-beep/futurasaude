import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUserFromRequest, getBeneficiarioByUserId, unauthorizedResponse } from '@/lib/autorizacoes';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const beneficiario = await getBeneficiarioByUserId(user.id);
    if (!beneficiario) {
      return NextResponse.json({ message: 'Beneficiário não encontrado' }, { status: 404 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('autorizacoes')
      .select('*, beneficiarios(nome_completo, cpf)')
      .eq('id', id)
      .eq('beneficiario_id', beneficiario.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: 'Erro ao buscar autorização' }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ message: 'Autorização não encontrada' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
