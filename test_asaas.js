// Testar ambiente sandbox
const apiKey = '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk3Njk6OiRhYWNoXzI5YzI5YzI5LTU5YjItNDU5Zi1hNzI0LTU5YzI5YzI5YzI5Yg==';

// Sandbox usa URL diferente
const baseUrl = 'https://sandbox.asaas.com/api/v3';

const payload = {
  name: 'Teste Usuario',
  cpfCnpj: '12345678901',
  externalReference: 'test-123'
};

fetch(`${baseUrl}/customers`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'access_token': apiKey
  },
  body: JSON.stringify(payload)
})
.then(async r => {
  const text = await r.text();
  console.log('Status:', r.status);
  console.log('Response:', text);
})
.catch(err => console.error('Erro:', err));
