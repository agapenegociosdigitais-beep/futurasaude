import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.nome_clinica !== undefined) updateData.nome_clinica = body.nome_clinica.trim();
    if (body.nome_profissional !== undefined) updateData.nome_profissional = body.nome_profissional?.trim() || null;
    if (body.especialidade_id !== undefined) updateData.especialidade_id = body.especialidade_id;
    if (body.registro_profissional !== undefined) updateData.registro_profissional = body.registro_profissional?.trim() || null;
    if (body.foto_url !== undefined) updateData.foto_url = body.foto_url || null;
    if (body.endereco !== undefined) updateData.endereco = body.endereco?.trim() || null;
    if (body.bairro !== undefined) updateData.bairro = body.bairro?.trim() || null;
    if (body.cidade !== undefined) updateData.cidade = body.cidade.trim();
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp?.trim() || null;
    if (body.horario !== undefined) updateData.horario = body.horario?.trim() || null;
    if (body.ativo !== undefined) updateData.ativo = body.ativo;

    const { data, error } = await supabaseAdmin
      .from('clinicas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro atualizar clínica:', error);
      return NextResponse.json(
        { message: 'Erro ao atualizar clínica', detail: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: 'Clínica não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erro interno clínicas PUT:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await Promise.resolve(params);

    const { error } = await supabaseAdmin
      .from('clinicas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro deletar clínica:', error);
      return NextResponse.json(
        { message: 'Erro ao deletar clínica', detail: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Clínica deletada com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro interno clínicas DELETE:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
