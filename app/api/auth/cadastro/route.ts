import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function gerarNumeroCartao(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('criar_beneficiario_seq');

  if (!error && data !== null && data !== undefined) {
    return `FS${String(data).padStart(6, '0')}`;
  }

  const { data: lastCard } = await supabaseAdmin
    .from('beneficiarios')
    .select('numero_cartao')
    .order('numero_cartao', { ascending: false })
    .limit(1)
    .single();

  if (lastCard?.numero_cartao) {
    const num = parseInt(lastCard.numero_cartao.replace('FS', ''), 10) + 1;
    return `FS${String(num).padStart(6, '0')}`;
  }

  return 'FS001000';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nome_completo,
      cpf,
      whatsapp,
      email,
      password,
      data_nascimento,
      cidade,
      bairro,
      cep,
      beneficiario_nome,
      beneficiario_cpf,
      beneficiario_data_nascimento,
      beneficiario_parentesco,
      beneficiario_whatsapp,
      beneficiario_escola,
      beneficiario_cidade,
    } = body;

    if (!nome_completo?.trim()) {
      return NextResponse.json({ message: 'Nome completo é obrigatório' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'E-mail inválido' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ message: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }
    if (!cpf?.trim() || cpf.replace(/\D/g, '').length !== 11) {
      return NextResponse.json({ message: 'CPF inválido' }, { status: 400 });
    }
    if (!data_nascimento?.trim()) {
      return NextResponse.json({ message: 'Data de nascimento é obrigatória' }, { status: 400 });
    }
    if (!whatsapp?.trim()) {
      return NextResponse.json({ message: 'WhatsApp é obrigatório' }, { status: 400 });
    }
    if (!cidade?.trim()) {
      return NextResponse.json({ message: 'Cidade é obrigatória' }, { status: 400 });
    }
    if (!bairro?.trim()) {
      return NextResponse.json({ message: 'Bairro é obrigatório' }, { status: 400 });
    }

    const benNome = beneficiario_nome?.trim() || nome_completo;
    const benCpf = beneficiario_cpf?.trim() || cpf;
    const benNasc = beneficiario_data_nascimento?.trim() || data_nascimento;

    const { data: emailExiste } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (emailExiste) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.' },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { message: 'Este e-mail já está cadastrado. Faça login.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: 'Erro ao criar conta: ' + authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .insert({
        id: userId,
        tipo: 'beneficiario',
        nome_completo: nome_completo.trim(),
        cpf: cpf.replace(/\D/g, ''),
        whatsapp: whatsapp.replace(/\D/g, ''),
        email: email.toLowerCase().trim(),
        data_nascimento,
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        cep: cep?.replace(/\D/g, '') || '',
      });

    if (perfilError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Erro perfil:', perfilError);

      if (perfilError.code === '23505') {
        if (perfilError.message.includes('cpf')) {
          return NextResponse.json({ message: 'CPF já cadastrado' }, { status: 400 });
        }
        if (perfilError.message.includes('email')) {
          return NextResponse.json({ message: 'E-mail já cadastrado' }, { status: 400 });
        }
      }

      return NextResponse.json({ message: 'Erro ao criar perfil. Tente novamente.' }, { status: 400 });
    }

    // Usa RPC atômica para evitar race condition no número do cartão
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      'criar_beneficiario_seguro',
      {
        p_responsavel_id: userId,
        p_nome_completo: benNome,
        p_cpf: benCpf.replace(/\D/g, ''),
        p_data_nascimento: benNasc || null,
        p_telefone: beneficiario_whatsapp?.replace(/\D/g, '') || null,
        p_email: null,
      }
    );

    let beneficiarioId: string;
    let numeroCartao: string;

    if (rpcError || !rpcResult) {
      console.warn('RPC falhou, usando fallback:', rpcError?.message);
      numeroCartao = await gerarNumeroCartao();

      const { data: benefData, error: benefError } = await supabaseAdmin
        .from('beneficiarios')
        .insert({
          responsavel_id: userId,
          numero_cartao: numeroCartao,
          nome_completo: benNome,
          cpf: benCpf.replace(/\D/g, ''),
          data_nascimento: benNasc || null,
          parentesco: beneficiario_parentesco || 'Titular',
          whatsapp: beneficiario_whatsapp?.replace(/\D/g, '') || '',
          escola: beneficiario_escola?.trim() || null,
          cidade: beneficiario_cidade?.trim() || null,
          status: 'pendente',
          sorteio_participa: false,
        })
        .select()
        .single();

      if (benefError) {
        await supabaseAdmin.from('perfis').delete().eq('id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.error('Erro beneficiário:', benefError);
        return NextResponse.json({ message: 'Erro ao criar beneficiário.' }, { status: 400 });
      }

      beneficiarioId = benefData.id;
    } else {
      beneficiarioId = rpcResult.id;
      numeroCartao = rpcResult.numero_cartao;

      // Atualiza campos extras que o RPC simplificado não cobre
      await supabaseAdmin
        .from('beneficiarios')
        .update({
          parentesco: beneficiario_parentesco || 'Titular',
          whatsapp: beneficiario_whatsapp?.replace(/\D/g, '') || '',
          escola: beneficiario_escola?.trim() || null,
          cidade: beneficiario_cidade?.trim() || null,
        })
        .eq('id', beneficiarioId);
    }

    // Login automático
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

    const response = NextResponse.json(
      {
        beneficiario_id: beneficiarioId,
        numero_cartao: numeroCartao,
        access_token: signInData?.session?.access_token || null,
        refresh_token: signInData?.session?.refresh_token || null,
        message: signInError ? 'Conta criada! Faça login para continuar.' : 'Conta criada com sucesso!',
      },
      { status: 201 }
    );

    if (signInData?.session) {
      const isProd = process.env.NODE_ENV === 'production';

      response.cookies.set('sb-access-token', signInData.session.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 604800,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Erro cadastro:', error);
    return NextResponse.json({ message: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
