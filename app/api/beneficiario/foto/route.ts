import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verificar token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Verificar usuário
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    // Pegar arquivo do form
    const formData = await request.formData();
    const foto = formData.get('foto') as File;

    if (!foto) {
      return NextResponse.json({ message: 'Nenhuma foto enviada' }, { status: 400 });
    }

    // Validar tamanho (max 2MB)
    if (foto.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: 'Foto muito grande. Máximo 2MB.' }, { status: 400 });
    }

    // Validar tipo
    if (!foto.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Arquivo inválido. Envie uma imagem.' }, { status: 400 });
    }

    // Converter para buffer
    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nome único do arquivo
    const ext = foto.type.split('/')[1] || 'jpg';
    const fileName = `${user.id}/foto-perfil.${ext}`;

    // Upload para Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('fotos-perfil')
      .upload(fileName, buffer, {
        contentType: foto.type,
        upsert: true, // Substituir se já existe
      });

    if (uploadError) {
      console.error('Erro upload:', uploadError);
      return NextResponse.json({ message: 'Erro ao salvar foto' }, { status: 500 });
    }

    // Pegar URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    const fotoUrl = urlData.publicUrl + '?t=' + Date.now(); // Cache busting

    // Salvar URL no perfil do beneficiário
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
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    // Buscar foto do beneficiário
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
