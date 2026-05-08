import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const formData = await request.formData();
    const foto = formData.get('foto') as File;

    if (!foto) {
      return NextResponse.json({ message: 'Nenhuma foto enviada' }, { status: 400 });
    }

    if (foto.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'Foto muito grande. Maximo 2MB.' }, { status: 400 });
    }

    if (!foto.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Arquivo invalido. Envie uma imagem.' }, { status: 400 });
    }

    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = foto.type.split('/')[1] || 'jpg';
    const fileName = `${user.id}/foto-perfil.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('fotos-perfil')
      .upload(fileName, buffer, {
        contentType: foto.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro upload:', uploadError);
      return NextResponse.json({ message: 'Erro ao salvar foto' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    const fotoUrl = urlData.publicUrl + '?t=' + Date.now();

    await supabaseAdmin
      .from('beneficiarios')
      .update({ foto_url: fotoUrl })
      .eq('responsavel_id', user.id);

    return NextResponse.json({ url: fotoUrl, message: 'Foto salva com sucesso!' });
  } catch (error: any) {
    console.error('Erro foto:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const { data: beneficiario } = await supabaseAdmin
      .from('beneficiarios')
      .select('foto_url')
      .eq('responsavel_id', user.id)
      .single();

    return NextResponse.json({ url: beneficiario?.foto_url || null });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
