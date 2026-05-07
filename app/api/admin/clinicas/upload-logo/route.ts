import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const clinicaId = formData.get('clinica_id') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 2MB.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Arquivo inválido. Envie uma imagem.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.split('/')[1] || 'jpg';
    const timestamp = Date.now();
    const fileName = clinicaId
      ? `clinicas/${clinicaId}/logo.${ext}`
      : `clinicas/temp_${timestamp}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('fotos-perfil')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro upload logo:', uploadError);
      return NextResponse.json({ message: 'Erro ao salvar logo', detail: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl + '?t=' + timestamp;

    if (clinicaId) {
      await supabaseAdmin
        .from('clinicas')
        .update({ foto_url: logoUrl })
        .eq('id', clinicaId);
    }

    return NextResponse.json({ url: logoUrl, message: 'Logo salva com sucesso!' });
  } catch (error: any) {
    console.error('Erro upload logo:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
