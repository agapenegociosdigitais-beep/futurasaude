const https = require('https');

const BASE_URL = 'https://futura-saude.vercel.app';

async function testPaymentFlow() {
  console.log('=== TESTE DE FLUXO DE PAGAMENTO ===\n');

  // 1. Buscar um beneficiário de teste
  console.log('1. Buscando beneficiário...');

  const beneficiarioId = 'test-beneficiario-id'; // Você precisa fornecer um ID real

  // 2. Criar pagamento PIX
  console.log('2. Criando pagamento PIX...');

  const paymentPayload = {
    beneficiario_id: beneficiarioId,
    metodo: 'pix'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/pagamento/criar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload)
    });

    const data = await response.json();

    console.log('\nStatus:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.pixQrCode) {
      console.log('\n✅ QR Code PIX gerado com sucesso!');
      console.log('Gateway ID:', data.gateway_id);
      console.log('Pagamento ID:', data.pagamento_id);
      console.log('\nPIX Copia e Cola (primeiros 50 chars):');
      console.log(data.pixCopyPaste?.substring(0, 50) + '...');
    } else {
      console.log('\n❌ Erro ao gerar PIX');
    }

    // 3. Verificar status
    if (data.pagamento_id) {
      console.log('\n3. Verificando status do pagamento...');

      const statusResponse = await fetch(`${BASE_URL}/api/pagamento/status/${data.gateway_id}`);
      const statusData = await statusResponse.json();

      console.log('Status atual:', statusData.status);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

// Executar teste
testPaymentFlow();
