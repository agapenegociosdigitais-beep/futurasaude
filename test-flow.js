const http = require('http');

function makeRequest(path, method, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json'
    };

    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function gerarCPF() {
  const n = () => Math.floor(Math.random() * 10);
  return `${n()}${n()}${n()}${n()}${n()}${n()}${n()}${n()}${n()}${n()}${n()}`;
}

async function testarFluxo() {
  try {
    const cpf = gerarCPF();
    const email = `teste${Date.now()}@example.com`;

    console.log('=== TESTE DE FLUXO COMPLETO ===\n');
    console.log('1. Criando cadastro...');

    const cadastro = await makeRequest('/api/auth/cadastro', 'POST', {
      nome_completo: 'João Silva Teste',
      cpf,
      email,
      whatsapp: '11987654321',
      password: 'Senha123!',
      data_nascimento: '1985-03-15',
      cidade: 'São Paulo',
      bairro: 'Centro',
      cep: '01310100'
    });

    if (cadastro.status !== 201) {
      console.log('❌ Falha no cadastro:', cadastro.data);
      return;
    }

    console.log('✅ Cadastro criado!');
    console.log('   Beneficiário ID:', cadastro.data.beneficiario_id);
    console.log('   Cartão:', cadastro.data.numero_cartao);

    const beneficiarioId = cadastro.data.beneficiario_id;

    console.log('\n2. Fazendo login...');

    const login = await makeRequest('/api/auth/login', 'POST', {
      email,
      password: 'Senha123!'
    });

    if (login.status !== 200) {
      console.log('❌ Falha no login:', login.data);
      return;
    }

    console.log('✅ Login realizado!');
    const token = login.data.token;

    console.log('\n3. Criando assinatura...');

    const assinatura = await makeRequest('/api/assinaturas', 'POST', {
      beneficiario_id: beneficiarioId,
      plano_id: 1,
      forma_pagamento: 'PIX'
    }, token);

    if (assinatura.status !== 201) {
      console.log('❌ Falha na assinatura:', assinatura.data);
      return;
    }

    console.log('✅ Assinatura criada!');
    console.log('   ID:', assinatura.data.assinatura_id);
    console.log('   Status:', assinatura.data.status);

    console.log('\n4. Gerando pagamento PIX...');

    const pagamento = await makeRequest('/api/pagamentos/pix', 'POST', {
      assinatura_id: assinatura.data.assinatura_id
    }, token);

    if (pagamento.status !== 200) {
      console.log('❌ Falha ao gerar PIX:', pagamento.data);
      return;
    }

    console.log('✅ PIX gerado!');
    console.log('   Código:', pagamento.data.qr_code.substring(0, 50) + '...');
    console.log('   Expira em:', pagamento.data.expiracao);

    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarFluxo();
