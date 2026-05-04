# 🔌 Integração Asaas - Futura Saúde

## 📋 Resumo da Implementação Atual

### Fluxo Completo
```
1. Criar/Buscar Customer no Asaas (por CPF)
2. Criar Cobrança (PIX ou Cartão)
3. Gerar QR Code PIX (se método = PIX)
4. Salvar pagamento no banco (status: pendente)
5. Webhook recebe confirmação do Asaas
6. Atualizar pagamento (status: pago)
7. Ativar beneficiário (status: ativo, plano válido por 1 ano)
```

---

## 🔑 Variáveis de Ambiente

```env
# Asaas API
ASAAS_API_KEY=aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzI1Njk6OiRhYWNoXzRiZjU1YzJjLTBmNDItNDI5Ny1iNjI5LTI5YjI5YzI5ZjI5Nw==
ASAAS_WEBHOOK_TOKEN=seu_token_secreto_aqui
ASAAS_ENVIRONMENT=sandbox  # ou 'production'
```

**URLs Base:**
- Sandbox: `https://sandbox.asaas.com/api/v3`
- Produção: `https://api.asaas.com/api/v3`

---

## 📡 API Endpoints Implementados

### 1. POST `/api/pagamento/criar`

**Entrada:**
```json
{
  "beneficiario_id": "uuid",
  "metodo": "pix" | "cartao_credito"
}
```

**Saída (PIX):**
```json
{
  "pagamento_id": "uuid-do-banco",
  "gateway_id": "pay_123456789",
  "pixQrCode": "data:image/png;base64,iVBORw0KG...",
  "pixCopyPaste": "00020126580014br.gov.bcb.pix...",
  "status": "pendente"
}
```

**Saída (Cartão):**
```json
{
  "pagamento_id": "uuid-do-banco",
  "gateway_id": "pay_123456789",
  "status": "pendente"
}
```

**Processo Interno:**
1. Busca beneficiário no banco (valida CPF, nome)
2. Chama `criarOuBuscarCustomer()` → retorna `customer_id`
3. Cria cobrança no Asaas via `POST /payments`
4. Se PIX: busca QR Code via `GET /payments/{id}/pixQrCode`
5. Salva registro na tabela `pagamentos`

---

### 2. POST `/api/webhook/pagamento`

**Headers Obrigatórios:**
```
asaas-access-token: seu_token_secreto_aqui
```

**Payload do Asaas:**
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_123456789",
    "status": "CONFIRMED",
    "customer": "cus_000005117997",
    "value": 99.90,
    "netValue": 98.41,
    "billingType": "PIX",
    "dateCreated": "2026-05-03",
    "confirmedDate": "2026-05-03 14:30:00"
  }
}
```

**Status Mapeados:**
| Asaas Status | Banco Status | Ação |
|--------------|--------------|------|
| `CONFIRMED` | `pago` | Ativa beneficiário |
| `RECEIVED` | `pago` | Ativa beneficiário |
| `REFUNDED` | `reembolsado` | Apenas atualiza |
| `OVERDUE` | `falhou` | Apenas atualiza |
| `PAYMENT_FAILED` | `falhou` | Apenas atualiza |

**Ativação do Beneficiário:**
```sql
UPDATE beneficiarios SET
  status = 'ativo',
  plano_inicio = CURRENT_DATE,
  plano_fim = CURRENT_DATE + INTERVAL '1 year',
  sorteio_participa = true
WHERE id = beneficiario_id;
```

---

## 🔄 Chamadas Asaas Detalhadas

### A. Buscar Customer por CPF
```http
GET /customers?cpfCnpj=12345678900
Headers:
  access_token: aact_...
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "cus_000005117997",
      "name": "João Silva",
      "cpfCnpj": "12345678900"
    }
  ]
}
```

---

### B. Criar Customer
```http
POST /customers
Headers:
  access_token: aact_...
  Content-Type: application/json

Body:
{
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "externalReference": "uuid-beneficiario"
}
```

**Resposta:**
```json
{
  "id": "cus_000005117997",
  "name": "João Silva",
  "cpfCnpj": "12345678900"
}
```

---

### C. Criar Cobrança PIX
```http
POST /payments
Headers:
  access_token: aact_...
  Content-Type: application/json

Body:
{
  "customer": "cus_000005117997",
  "billingType": "PIX",
  "value": 99.90,
  "dueDate": "2026-05-04",
  "description": "Cartão Futura Saúde - Plano Anual",
  "externalReference": "uuid-beneficiario"
}
```

**Resposta:**
```json
{
  "id": "pay_123456789",
  "status": "PENDING",
  "customer": "cus_000005117997",
  "value": 99.90,
  "netValue": 98.41,
  "billingType": "PIX",
  "dueDate": "2026-05-04"
}
```

---

### D. Gerar QR Code PIX
```http
GET /payments/pay_123456789/pixQrCode
Headers:
  access_token: aact_...
```

**Resposta:**
```json
{
  "encodedImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "payload": "00020126580014br.gov.bcb.pix0136...",
  "expirationDate": "2026-05-04 23:59:59"
}
```

---

### E. Criar Cobrança Cartão de Crédito
```http
POST /payments
Headers:
  access_token: aact_...
  Content-Type: application/json

Body:
{
  "customer": "cus_000005117997",
  "billingType": "CREDIT_CARD",
  "value": 99.90,
  "dueDate": "2026-05-04",
  "description": "Cartão Futura Saúde - Plano Anual",
  "externalReference": "uuid-beneficiario",
  "creditCard": {
    "holderName": "JOAO SILVA",
    "number": "5162306219378829",
    "expiryMonth": "12",
    "expiryYear": "2028",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "João Silva",
    "cpfCnpj": "12345678900",
    "postalCode": "68040-000",
    "addressNumber": "123",
    "phone": "93984133130"
  }
}
```

**Resposta:**
```json
{
  "id": "pay_987654321",
  "status": "CONFIRMED",
  "customer": "cus_000005117997",
  "value": 99.90,
  "netValue": 95.90,
  "billingType": "CREDIT_CARD",
  "creditCard": {
    "creditCardNumber": "5162-****-****-8829",
    "creditCardBrand": "MASTERCARD"
  }
}
```

---

## ⚠️ Pontos Importantes

### 1. Modo Simulado
Se `ASAAS_API_KEY` não estiver configurada ou for `aact_your_key_here`:
- Retorna dados fake (QR Code 1x1px, código PIX simulado)
- Útil para desenvolvimento sem gastar créditos

### 2. Webhook Token
- Em desenvolvimento: aceita qualquer token se `ASAAS_WEBHOOK_TOKEN` não configurado
- Em produção: OBRIGATÓRIO validar token

### 3. Valor Fixo
- Atualmente hardcoded: `R$ 99,90`
- Pode ser parametrizado no futuro (planos diferentes)

### 4. Vencimento
- PIX: +24h da criação
- Cartão: processado imediatamente

### 5. Customer Único
- Busca por CPF antes de criar
- Evita duplicação no Asaas
- `externalReference` = `beneficiario_id` (rastreabilidade)

---

## 🚀 Próximas Implementações Necessárias

### 1. Cartão de Crédito - Frontend
**Falta criar:**
- Formulário de captura de dados do cartão
- Validação de número, CVV, validade
- Tokenização (se necessário)
- Envio para `/api/pagamento/criar` com dados do cartão

**Endpoint já suporta**, mas precisa receber:
```json
{
  "beneficiario_id": "uuid",
  "metodo": "cartao_credito",
  "creditCard": {
    "holderName": "JOAO SILVA",
    "number": "5162306219378829",
    "expiryMonth": "12",
    "expiryYear": "2028",
    "ccv": "318"
  }
}
```

### 2. Parcelamento
Asaas suporta até 12x:
```json
{
  "installmentCount": 3,
  "installmentValue": 33.30
}
```

### 3. Boleto
```json
{
  "billingType": "BOLETO",
  "dueDate": "2026-05-10"
}
```

Retorna:
```json
{
  "bankSlipUrl": "https://...",
  "identificationField": "34191.79001 01043.510047 91020.150008 1 82880000099900"
}
```

### 4. Assinatura Recorrente
Para renovação automática:
```http
POST /subscriptions
{
  "customer": "cus_...",
  "billingType": "CREDIT_CARD",
  "value": 99.90,
  "cycle": "YEARLY",
  "nextDueDate": "2027-05-03"
}
```

---

## 🧪 Testes

### Cartões de Teste (Sandbox)
| Bandeira | Número | CVV | Resultado |
|----------|--------|-----|-----------|
| Visa | 4000000000000010 | 123 | Aprovado |
| Mastercard | 5162306219378829 | 318 | Aprovado |
| Elo | 6362970000457013 | 123 | Aprovado |
| Visa | 4000000000000028 | 123 | Recusado |

### PIX de Teste
- Qualquer valor gera QR Code válido
- Não é necessário pagar de verdade
- Use `/api/pagamento/simular` para aprovar instantaneamente

---

## 📊 Estrutura do Banco

```sql
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID REFERENCES beneficiarios(id),
  responsavel_id UUID REFERENCES perfis(id),
  gateway VARCHAR(20) CHECK (gateway IN ('asaas', 'mercadopago', 'pagseguro')),
  gateway_id TEXT UNIQUE,
  metodo VARCHAR(20) CHECK (metodo IN ('pix', 'cartao_credito', 'boleto')),
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'reembolsado', 'falhou')),
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

---

**Última atualização:** 2026-05-03
**Versão da API Asaas:** v3
