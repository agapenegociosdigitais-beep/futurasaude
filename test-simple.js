const http = require('http');

const data = JSON.stringify({
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

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/cadastro',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Enviando cadastro...\n');

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('\nResposta:', body);
    if (res.statusCode === 201) {
      console.log('\n✅ Cadastro criado com sucesso!');
    } else {
      console.log('\n❌ Erro no cadastro');
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e);
});

req.write(data);
req.end();
