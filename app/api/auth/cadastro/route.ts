import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin com service_role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Gerar número do cartão único: FS-2025-00042
async function gerarNumeroCartao(): Promise<string> {
  const ano = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from('beneficiarios')
    .select('*', { count: 'exact', head: true });
  const num = String((count || 0) + 1).padStart(5, '0');
  return `FS-${ano}-${num}`;
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
    } = body;

    // ── Validações ──
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

    // Beneficiário — usar dados do responsável se não informado
    const benNome = beneficiario_nome?.trim() || nome_completo;
    const benCpf = beneficiario_cpf?.trim() || cpf;
    const benNasc = beneficiario_data_nascimento?.trim() || data_nascimento;

    // ── Verificar se email já existe ──
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

    // ── Criar usuário no Supabase Auth ──
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

    // ── Criar perfil do responsável ──
    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .insert({
        id: userId,
        tipo: 'beneficiario',
        nome_completo: nome_completo.trim(),
        cpf: cpf.replace(/\D/g, ''),
        whatsapp: whatsapp.replace(/\D/g, ''),
        email: email.toLowerCase().trim(),
        data_nascimento: data_nascimento,
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        cep: cep?.replace(/\D/g, '') || '',
      });

    if (perfilError) {
      // Rollback — remover usuário criado
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Erro perfil:', perfilError);
      return NextResponse.json(
        { message: 'Erro ao criar perfil. Tente novamente.' },
        { status: 400 }
      );
    }

    // ── Gerar número do cartão ──
    const numeroCartao = await gerarNumeroCartao();

    // ── Criar beneficiário ──
    const { data: beneficiarioData, error: benefError } = await supabaseAdmin
      .from('beneficiarios')
      .insert({
        responsavel_id: userId,
        numero_cartao: numeroCartao,
        nome_completo: benNome,
        cpf: benCpf.replace(/\D/g, ''),
        data_nascimento: benNasc || null,
        parentesco: beneficiario_parentesco || 'Titular',
        whatsapp: beneficiario_whatsapp?.replace(/\D/g, '') || '',
        status: 'pendente',
        sorteio_participa: false,
      })
      .select()
      .single();

    if (benefError) {
      // Rollback
      await supabaseAdmin.from('perfis').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Erro beneficiário:', benefError);
      return NextResponse.json(
        { message: 'Erro ao criar beneficiário. Tente novamente.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        beneficiario_id: beneficiarioData.id,
        numero_cartao: numeroCartao,
        message: 'Conta criada com sucesso!'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Erro cadastro:', error);
    return NextResponse.json(
      { message: 'Erro interno. Tente novamente em alguns instantes.' },
      { status: 500 }
    );
  }
}
