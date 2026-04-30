# 🔄 Fluxo de Cadastro e Pagamento - Futura Saúde

## ✅ Implementado em 30/04/2026

### 1. Fluxo Completo
```
Landing Page → Cadastro (3 passos) → Pagamento → Webhook → Ativação → Login
```

### 2. APIs Criadas/Corrigidas

#### `/api/auth/cadastro` (POST)
- Cria usuário no Supabase Auth
- Cria perfil na tabela `perfis`
- Cria beneficiário na tabela `beneficiarios`
- Gera número do cartão único (FS-2026-XXXXX)
- Retorna `beneficiario_id` e `numero_cartao`
- Status inicial: `pendente`

#### `/api/pagamento/criar` (POST)
**Entrada:**
```json
{
  "beneficiario_id": "uuid",
  "metodo": "pix" | "cartao_credito"
}
```

**Saída:**
```json
{
  "pagamento_id": "uuid",
  "gateway_id": "asaas-id",
  "pixQrCode": "data:image/png;base64,...",
  "pixCopyPaste": "00020126...",
  "status": "pendente"
}
```

**Funcionalidades:**
- Integração com Asaas (sandbox)
- Gera QR Code PIX real
- Cria registro na tabela `pagamentos`
- Fallback para modo simulado se `ASAAS_API_KEY` não configurada

#### `/api/pagamento/status/[id]` (GET)
- Retorna status atual do pagamento
- Usado pelo polling da página de pagamento

#### `/api/pagamento/simular` (POST)
**Apenas para desenvolvimento**
```json
{
  "pagamento_id": "uuid"
}
```
- Simula pagamento aprovado instantaneamente
- Ativa beneficiário sem pagamento real
- Útil para testes

#### `/api/webhook/pagamento` (POST)
**Recebe eventos do Asaas:**
- `CONFIRMED` / `RECEIVED` → status: `pago`
- `REFUNDED` → status: `reembolsado`
- `OVERDUE` / `PAYMENT_FAILED` → status: `falhou`

**Ao confirmar pagamento:**
1. Atualiza `pagamentos.status = 'pago'`
2. Define `pagamentos.pago_em = now()`
3. Atualiza beneficiário:
   - `status = 'ativo'`
   - `plano_inicio = hoje`
   - `plano_fim = hoje + 1 ano`
   - `sorteio_participa = true`

### 3. Página de Pagamento (`/pagamento`)

**URL:** `/pagamento?beneficiario_id=XXX`

**Funcionalidades:**
- Tabs PIX / Cartão de Crédito
- Gera QR Code ao clicar "Pagar com PIX"
- Exibe código PIX copia-e-cola
- Botão copiar código
- Polling automático a cada 5s para verificar status
- Timeout de 10 minutos
- Botão "Simular Pagamento" em modo dev
- Redirecionamento automático para `/login` após confirmação

**Tecnologias:**
- Next.js 14 App Router
- Suspense boundary para `useSearchParams()`
- Client-side rendering

### 4. Redirecionamento do Cadastro

**Arquivo:** `public/cadastro.html`

**Linha 676-686:**
```javascript
if (result.data.beneficiario_id) {
  sessionStorage.setItem('beneficiario_id', result.data.beneficiario_id);
  sessionStorage.setItem('numero_cartao', result.data.numero_cartao || '');
  sessionStorage.setItem('usuario_email', email);
  sessionStorage.setItem('usuario_nome', nome);
  window.location.href = '/pagamento?beneficiario_id=' + result.data.beneficiario_id;
}
```

### 5. Estrutura do Banco (Supabase)

#### Tabela `pagamentos`
```sql
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY,
  beneficiario_id UUID REFERENCES beneficiarios(id),
  responsavel_id UUID REFERENCES perfis(id),
  gateway VARCHAR(20) CHECK (gateway IN ('asaas', 'mercadopago', 'pagseguro')),
  gateway_id TEXT UNIQUE,
  metodo VARCHAR(20) CHECK (metodo IN ('pix', 'cartao_credito', 'boleto')),
  valor NUMERIC(10, 2),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'reembolsado', 'falhou')),
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6. Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fqdhapwfvmmjpzqbkxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://futurasaude.vercel.app
NEXT_PUBLIC_WHATSAPP_SUPORTE=5593984133130

# Gateway (Asaas)
ASAAS_API_KEY=... (opcional - usa modo simulado se não configurado)
ASAAS_WEBHOOK_TOKEN=... (opcional - aceita todos em dev)
```

### 7. Como Testar

#### Teste Completo (Produção):
1. Acesse https://futurasaude.vercel.app/cadastro
2. Preencha os 3 passos
3. Será redirecionado para `/pagamento?beneficiario_id=XXX`
4. Clique em "Pagar com PIX"
5. Escaneie o QR Code ou copie o código
6. Aguarde confirmação (polling automático)
7. Será redirecionado para `/login`

#### Teste Rápido (Desenvolvimento):
1. Acesse http://localhost:3000/cadastro
2. Preencha os 3 passos
3. Na página de pagamento, clique "🧪 Simular Pagamento (DEV)"
4. Será redirecionado para `/login` instantaneamente

### 8. Webhook do Asaas

**URL para configurar no painel Asaas:**
```
https://futurasaude.vercel.app/api/webhook/pagamento
```

**Headers esperados:**
```
asaas-access-token: [seu token]
```

**Eventos processados:**
- `PAYMENT_CONFIRMED`
- `PAYMENT_RECEIVED`
- `PAYMENT_REFUNDED`
- `PAYMENT_OVERDUE`

### 9. Arquivos Modificados

```
app/api/pagamento/criar/route.ts          (reescrito)
app/api/pagamento/simular/route.ts        (novo)
app/api/webhook/pagamento/route.ts        (reescrito)
app/pagamento/page.tsx                    (reescrito)
app/pagamento/PagamentoContent.tsx        (novo)
public/cadastro.html                      (linha 676-686)
```

### 10. Próximos Passos

- [ ] Configurar `ASAAS_API_KEY` real (atualmente em modo simulado)
- [ ] Configurar `ASAAS_WEBHOOK_TOKEN` no Asaas
- [ ] Testar webhook real com pagamento PIX
- [ ] Implementar integração com cartão de crédito
- [ ] Configurar emails de boas-vindas (Resend)
- [ ] Configurar WhatsApp automático (Z-API)

---

**Deploy:** https://futurasaude.vercel.app
**Commit:** 412ffe5
**Data:** 30/04/2026
