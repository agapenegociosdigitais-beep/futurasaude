const ASAAS_API_KEY = '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwOTU5NTU6OiRhYWNoXzI5YzI5YzI5LTU5YjItNDU0Yy04ZjI5LTU0YzI5YzI5YzI5Yw==';
const ASAAS_ENV = 'production';

async function testAsaas() {
  const url = ASAAS_ENV === 'production' 
    ? 'https://api.asaas.com/v3/customers'
    : 'https://sandbox.asaas.com/api/v3/customers';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: JSON.stringify({
      name: 'Teste Claude',
      cpfCnpj: '12345678901',
      email: 'teste@example.com',
    }),
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testAsaas().catch(console.error);
