// Testar rota de pagamento local
const testPayment = async () => {
  const payload = {
    beneficiarioId: 'test-123',
    valor: 99.90,
    metodoPagamento: 'pix'
  };

  try {
    const response = await fetch('http://localhost:3000/api/pagamento/criar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro:', error.message);
  }
};

testPayment();
