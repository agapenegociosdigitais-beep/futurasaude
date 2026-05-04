const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.setTimeout(10000); // 10 segundos
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('1. Criando cadastro...\n');

  const cadastro = await makeRequest('/api/auth/cadastro', {
    nome_completo: 'Teste Silva',
    cpf: '12345678900',
    email: 'teste' + Date.now() + '@example.com',
    whatsapp: '11999999999',
    password: 'Teste123!',
    data_nascimento: '1990-01-01',
    cidade: 'São Paulo',
    bairro: 'Bela Vista',
    cep: '01310100'
  });

  console.log('Status:', cadastro.status);
  console.log('Resposta:', JSON.stringify(cadastro.data, null, 2));

  if (cadastro.status !== 201 || !cadastro.data.beneficiario_id) {
    console.log('\n❌ Falha no cadastro');
    return;
  }

  const beneficiarioId = cadastro.data.beneficiario_id;
  console.log('\n✅ Cadastro criado:', beneficiarioId);

  console.log('\n2. Criando pagamento PIX...\n');

  const pagamento = await makeRequest('/api/pagamento/criar', {
    beneficiario_id: beneficiarioId,
    metodo: 'pix'
  });

  console.log('Status:', pagamento.status);
  console.log('Resposta:', JSON.stringify(pagamento.data, null, 2));

  if (pagamento.data.pixQrCode) {
    console.log('\n✅ QR Code PIX gerado com sucesso!');
    console.log('Payload:', pagamento.data.pixCopyPaste?.substring(0, 50) + '...');
  } else {
    console.log('\n❌ QR Code não gerado');
  }
}

test().catch(console.error);
