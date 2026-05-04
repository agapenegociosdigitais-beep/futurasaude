const fetch = require('node-fetch');

const BASE_URL = 'https://futura-saude.vercel.app';

async function testCriarPagamento() {
  console.log('=== TESTE CRIAR PAGAMENTO PIX ===\n');

  // Usar ID fictício para teste no sandbox
  const payload = {
    beneficiario_id: '00000000-0000-0000-0000-000000000001',
    metodo: 'pix'
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('\nEnviando requisição...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/pagamento/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('Status HTTP:', response.status);
    console.log('\nResposta:');
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 201 && data.pixQrCode) {
      console.log('\n✅ SUCESSO - PIX gerado');
      console.log('Gateway ID:', data.gateway_id);
      console.log('Pagamento ID:', data.pagamento_id);
    } else if (response.status === 404) {
      console.log('\n⚠️  Beneficiário não encontrado (esperado para ID fictício)');
    } else {
      console.log('\n❌ Erro na criação');
    }
  } catch (error) {
    console.error('\n❌ Erro de rede:', error.message);
  }
}

testCriarPagamento();
