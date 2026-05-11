# 🏥 FUTURA SAÚDE — Briefing Completo do Projeto

## 📋 Visão Geral
**Nome:** Futura Saúde  
**Slogan:** "Educação e saúde pelo futuro do seu filho"  
**Produto:** Cartão de saúde digital para estudantes/beneficiários  
**Público-alvo:** Pais e responsáveis de estudantes  
**Preço:** R$99,90/ano  
**Localização:** Santarém — PA (expansão para outras cidades prevista)  
**WhatsApp de suporte:** 93992173231  

---

## 🎯 Modelo de Negócio
- Pai compra o cartão online
- Beneficiário ganha acesso a consultas gratuitas com dentista, psicólogo e optometrista
- Rede de 40 clínicas parceiras em Santarém
- Sorteio de bolsas de graduação (30%, 50% e até 100%) para portadores
- Plano anual com renovação automática
- Meta: 30-50 vendas por dia via cadastro online (sem WhatsApp para vendas)

---

## 🗂️ Arquivos HTML Originais Aprovados (Design Final)
Localizados em: `C:\Users\benja\Pictures\futura saude\files\`

| Arquivo | Função |
|---------|--------|
| `cartao-saude-final.html` | Landing page de vendas (99% pronta) |
| `futura-saude-auth.html` | Login, Cadastro (3 passos) e Pagamento |
| `futura-saude-dashboard.html` | Dashboard do beneficiário |
| `futura-saude-admin.html` | Painel administrativo completo |

---

## 💻 Projeto Next.js
**Localização:** `C:\projects\futura-saude\`  
**Servidor local:** `http://localhost:3000`  
**Comando para iniciar:** `npm run dev` (no PowerShell dentro da pasta)  

### Estrutura de páginas:
```
public/
  index.html     ← Landing page (HTML puro original)
  login.html     ← Login (HTML + chama API)
  cadastro.html  ← Cadastro (HTML + chama API)

app/
  pagamento/page.tsx    ← Next.js (processa pagamento real)
  dashboard/page.tsx    ← Next.js (protegido por middleware)
  admin/page.tsx        ← Next.js (protegido, requer role admin)
  api/
    auth/login/route.ts        ← API de login
    auth/cadastro/route.ts     ← API de cadastro
    pagamento/criar/route.ts   ← API de pagamento
    webhook/pagamento/route.ts ← Webhook dos gateways
```

---

## 🗄️ Banco de Dados — Supabase
**Projeto:** futura-saude  
**URL:** https://fqdhapwfvmmjpzqbkxws.supabase.co  
**Status:** ✅ 9 tabelas criadas com RLS  

### Tabelas criadas:
1. `perfis` — responsáveis financeiros
2. `beneficiarios` — quem usa o cartão
3. `especialidades` — dentista, psicólogo, optometrista, etc.
4. `clinicas` — parceiros credenciados
5. `pagamentos` — histórico de transações
6. `agendamentos` — solicitações de consultas
7. `acessos_dashboard` — log para relatórios
8. `sorteios` — registro de sorteios com auditoria
9. `configuracoes` — configurações globais

---

## 🔐 Segurança
- **Autenticação:** Supabase Auth (JWT)
- **Proteção de rotas:** middleware.ts
- **RLS:** ativado em todas as tabelas
- **Cookies:** sb-access-token + sb-refresh-token (httpOnly)
- **LGPD:** políticas implementadas

### Arquivos de segurança corrigidos (versões novas):
- `middleware.ts` — lê cookie sb-access-token diretamente
- `app/api/auth/login/route.ts` — salva cookies corretamente
- `public/login.html` — função fazerLogin() com IDs corretos

---

## 💳 Gateways de Pagamento
**Configuração:** Admin escolhe qual usar (invisível para cliente)  
**Opções:** Asaas, Mercado Pago, PagSeguro  
**Métodos para cliente:** PIX e Cartão de crédito (sem boleto)  

### Webhook implementado:
`app/api/webhook/pagamento/route.ts`  
**URL do webhook:** `https://futurasaude.com.br/api/webhook/pagamento`

**Fluxo automático após pagamento confirmado:**
1. Verifica autenticidade do webhook
2. Evita duplicatas
3. Ativa beneficiário no banco
4. Define validade = hoje + 1 ano
5. Cria usuário no Supabase Auth
6. Envia email com credenciais (pendente: configurar Resend)
7. Envia WhatsApp de confirmação (pendente: configurar Z-API)

---

## 🗺️ Funcionalidades Planejadas (próximas versões)

### Já no HTML mas pendente de implementar:
- [ ] Simulados do Ensino Médio (380 questões em 10 matérias)
- [ ] Rede de parceiros com desconto
- [ ] Artigos e conteúdos educativos
- [ ] Mapa de calor por cidade (Google Maps API)
- [ ] Notificações em massa via WhatsApp

### Novas tabelas necessárias:
- `simulados` — provas por matéria
- `questoes` — perguntas com 4 alternativas
- `respostas_aluno` — histórico
- `resultados_simulado` — pontuação
- `parceiros` — empresas com desconto
- `conteudos` — artigos educativos

---

## 📱 App Mobile (futuro)
**Stack planejada:** React Native + Expo  
**Backend:** mesmo Supabase e APIs do Next.js  
**Push notifications:** Expo Push API  
**Estratégia:** validar no web primeiro, depois lançar app  

---

## 🚀 Status Atual e Próximos Passos

### ✅ Concluído:
- [x] Design de todas as páginas (HTML aprovado)
- [x] Projeto Next.js criado e compilando
- [x] 37 páginas e 28 endpoints de API
- [x] 9 tabelas no Supabase com RLS
- [x] Middleware de autenticação
- [x] Webhook de pagamento completo
- [x] Landing page com botões corretos (/cadastro)
- [x] Botão "Tirar dúvidas" → WhatsApp
- [x] Botão "Acessar minha conta" → /login

### ⏳ Em andamento:
- [ ] **URGENTE:** Corrigir login (401 Unauthorized)
  - Substituir route.ts, middleware.ts, login.html
  - Criar usuário de teste no Supabase Authentication
  - Testar fluxo completo login → dashboard

### 🔜 Próximos passos em ordem:
1. Resolver login ← AGORA
2. Testar fluxo completo (cadastro → pagamento → dashboard)
3. Deploy na Vercel
4. Configurar domínio futurasaude.com.br
5. Integrar gateway de pagamento real (Asaas)
6. Configurar email (Resend)
7. Configurar WhatsApp (Z-API)
8. Adicionar simulados
9. Adicionar parceiros
10. Lançar app mobile

---

## 🔧 Variáveis de Ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://fqdhapwfvmmjpzqbkxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[salvo localmente]
SUPABASE_SERVICE_ROLE_KEY=[salvo localmente]
ASAAS_API_KEY=[pendente]
ASAAS_WEBHOOK_SECRET=[pendente]
MERCADOPAGO_ACCESS_TOKEN=[pendente]
PAGSEGURO_TOKEN=[pendente]
GATEWAY_ATIVO=asaas
GOOGLE_MAPS_API_KEY=[pendente]
ZAPI_TOKEN=[pendente]
ZAPI_INSTANCE=[pendente]
RESEND_API_KEY=[pendente]
NEXT_PUBLIC_APP_URL=https://futurasaude.com.br
NEXT_PUBLIC_WHATSAPP_SUPORTE=5593992173231
```

---

## 🎨 Design System
**Cores:**
- Azul principal: `#0a2a5e`
- Azul médio: `#1a4a8a`
- Dourado: `#f5c842`
- Laranja: `#f09a3e`
- Verde WhatsApp: `#25d366`

**Fontes:** Sora (textos) + Lora (títulos/serifa)

**Paleta de botões:**
- Principal (cadastro): verde `#25d366`
- Secundário (dúvidas): transparente com borda branca
- Terciário (login): transparente menor, discreto

---

## 👤 Informações do Desenvolvedor
**Nome:** Ben  
**Perfil:** Cirurgião-dentista com 14 anos de experiência  
**Empresa:** YHWH Tech (AI integrator)  
**Foco:** Automação para clínicas odontológicas  
**Stack preferida:** No-code/low-code (Make.com, n8n, Supabase, Bubble.io)  
**Ferramentas:** Claude Code, Cursor AI  

---

## 📞 Contatos do Projeto
- **WhatsApp suporte:** (93) 99217-3231
- **Email:** agapenegociosdigitais@gmail.com
- **Clínica parceira:** Clínica Ortomed (Santarém-PA)

---

*Documento gerado em: Abril 2026*  
*Versão: 1.0*
