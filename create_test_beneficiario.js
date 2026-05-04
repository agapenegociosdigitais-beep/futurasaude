const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestBeneficiario() {
  try {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'teste.pagamento@futura.com',
      password: 'senha123456',
      email_confirm: true,
    });

    if (authError) {
      console.error('Erro auth:', authError);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Usuário criado:', userId);

    // 2. Criar perfil
    const { error: perfilError } = await supabase
      .from('perfis')
      .insert({
        id: userId,
        tipo: 'beneficiario',
        nome_completo: 'Teste Pagamento',
        cpf: '12345678901',
        whatsapp: '93991234567',
        email: 'teste.pagamento@futura.com',
        data_nascimento: '1990-01-01',
        cidade: 'Santarém',
        bairro: 'Centro',
        cep: '68005000',
      });

    if (perfilError) {
      console.error('Erro perfil:', perfilError);
      await supabase.auth.admin.deleteUser(userId);
      return;
    }

    console.log('✅ Perfil criado');

    // 3. Criar beneficiário
    const { data: benefData, error: benefError } = await supabase
      .from('beneficiarios')
      .insert({
        responsavel_id: userId,
        numero_cartao: 'FS-2026-TEST01',
        nome_completo: 'Teste Pagamento',
        cpf: '12345678901',
        data_nascimento: '1990-01-01',
        parentesco: 'Titular',
        whatsapp: '93991234567',
        status: 'pendente',
        sorteio_participa: false,
      })
      .select()
      .single();

    if (benefError) {
      console.error('Erro beneficiário:', benefError);
      return;
    }

    console.log('✅ Beneficiário criado:', benefData.id);
    console.log('\n📋 Use este ID para testar pagamento:', benefData.id);

    return benefData.id;
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

createTestBeneficiario();
