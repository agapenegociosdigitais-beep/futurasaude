#!/bin/bash

echo "=== TESTE API PAGAMENTO FUTURA SAÚDE ==="
echo ""

# 1. Criar beneficiário
echo "1. Criando beneficiário de teste..."
CADASTRO=$(curl -k -s -X POST https://futura-saude.vercel.app/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "João Teste Silva",
    "cpf": "98765432100",
    "email": "joao.teste.'$(date +%s)'@teste.com",
    "password": "senha123456",
    "whatsapp": "93991234567",
    "data_nascimento": "1985-05-15"
  }')

echo "$CADASTRO"
BENEFICIARIO_ID=$(echo "$CADASTRO" | grep -o '"beneficiario_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$BENEFICIARIO_ID" ]; then
  echo "❌ Falha ao criar beneficiário"
  exit 1
fi

echo "✅ Beneficiário criado: $BENEFICIARIO_ID"
echo ""

# 2. Criar pagamento PIX
echo "2. Criando pagamento PIX..."
PAGAMENTO=$(curl -k -s -X POST https://futura-saude.vercel.app/api/pagamento/criar \
  -H "Content-Type: application/json" \
  -d "{
    \"beneficiario_id\": \"$BENEFICIARIO_ID\",
    \"metodo\": \"pix\"
  }")

echo "$PAGAMENTO" | head -c 500
echo ""

GATEWAY_ID=$(echo "$PAGAMENTO" | grep -o '"gateway_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$GATEWAY_ID" ]; then
  echo "❌ Falha ao criar pagamento"
  exit 1
fi

echo "✅ Pagamento criado: $GATEWAY_ID"
echo ""

# 3. Verificar status
echo "3. Verificando status do pagamento..."
STATUS=$(curl -k -s https://futura-saude.vercel.app/api/pagamento/status/$GATEWAY_ID)
echo "$STATUS"
echo ""

echo "=== TESTE CONCLUÍDO ==="
