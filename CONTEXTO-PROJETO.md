# Futura Saude - Contexto Completo do Projeto

> Salvo em: 2026-05-07 | Ultima sessao: 2026-05-06

---

## 1. Visao Geral

**Futura Saude** e uma plataforma de cartao de saude digital. Beneficiarios acessam carteirinha digital, agendamentos e perfil via dashboard. Administradores gerenciam beneficiarios, clinicas, financeiro e sorteios via painel admin.

- **Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Supabase (Auth + DB + Storage)
- **Deploy**: Vercel (producao) - https://futurasaude.com.br
- **Repo**: https://github.com/agapenegociosdigitais-beep/futurasaude
- **Pasta local**: `/c/projects/futura-saude`

---

## 2. Arquitetura de Autenticacao

### Duas rotas de login separadas:
- `/login` - para beneficiarios (redireciona para `/dashboard`)
- `/admin/login` - para admins (redireciona para `/admin`)

### Fluxo de login:
1. Front envia POST para `/api/auth/login` com `{ email, password }`
2. API valida via Supabase `signInWithPassword` (anon client, nao service role)
3. Retorna `{ access_token, refresh_token, user, perfil, message }`
4. API seta cookies httpOnly: `sb-access-token` e `sb-refresh-token`
5. Login de beneficiario salva token no localStorage tambem (para chamadas API do dashboard)
6. Login de admin usa `window.location.href = '/admin'` (NAO router.push - veja issue abaixo)

### Issue critico resolvido - Loop infinito no admin:
- **Causa**: `router.push('/admin')` fazia navegacao client-side que NAO incluia cookies httpOnly, entao middleware nao via o token e redirecionava de volta para login formando loop
- **Fix**: Trocar `router.push` por `window.location.href` para forcar full-page reload
- Commit: `e547ff5` - "Fix admin login redirect: use window.location instead of router.push"

### Middleware (`middleware.ts`):
- Rotas publicas: `/`, `/login`, `/cadastro`, `/pagamento`, `/admin/login`
- Rotas protegidas: `/dashboard/*`, `/admin/*`
- Valida token Supabase antes de redirecionar (evita redirect com token invalido)
- Suporta refresh de token automatico via `refreshSession`
- Para rotas `/admin/*`: verifica se perfil do usuario e "admin" na tabela `perfis`
- Se perfil nao e admin na rota admin, redireciona para `/dashboard`

---

## 3. Variaveis de Ambiente (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://fqdhapwfvmnjpzqbkxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<configured>
SUPABASE_SERVICE_ROLE_KEY=<configured>
NEXT_PUBLIC_ASaaS_API_KEY=<configured>
ASAAS_API_KEY=<configured>
NEXT_PUBLIC_APP_URL=https://futurasaude.com.br
```

Todas ja configuradas no Vercel production.

---

## 4. Estrutura de Diretorios

```
futura-saude/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind globals
│   ├── login/page.tsx              # Login beneficiario
│   ├── admin/
│   │   ├── login/page.tsx          # Login admin
│   │   └── page.tsx                # Dashboard admin (com sidebar)
│   ├── admin/beneficiarios/        # CRUD beneficiarios
│   ├── admin/clinicas/             # CRUD clinicas
│   ├── admin/financeiro/           # Financeiro
│   ├── admin/sorteio/              # Sorteios
│   ├── admin/especialidades/       # Especialidades
│   ├── admin/configuracoes/        # Configs
│   ├── cadastro/page.tsx           # Cadastro beneficiario
│   ├── dashboard/page.tsx          # Dashboard beneficiario (carteirinha)
│   ├── pagamento/                  # Pagamento PIX via Asaas
│   ├── pagamento-pendente/        # Pagina de status pendente
│   ├── api/
│   │   ├── auth/
│   │   │   ├── cadastro/route.ts   # Registro
│   │   │   ├── login/route.ts      # Login principal
│   │   │   ├── login-v2/route.ts   # Login alternativo
│   │   │   ├── logout/route.ts     # Logout (deleta cookies httpOnly)
│   │   │   └── session/route.ts    # Sessao atual
│   │   ├── beneficiario/
│   │   │   ├── perfil/route.ts     # Perfil beneficiario
│   │   │   ├── foto/route.ts       # Upload foto (Supabase Storage)
│   │   │   ├── carteirinha/route.ts
│   │   │   ├── clinicas/route.ts
│   │   │   └── agendamentos/route.ts
│   │   ├── admin/
│   │   │   ├── beneficiarios/
│   │   │   ├── clinicas/
│   │   │   ├── configuracoes/
│   │   │   ├── dashboard/
│   │   │   ├── especialidades/
│   │   │   ├── financeiro/
│   │   │   ├── mapa/
│   │   │   ├── mensagens/
│   │   │   ├── sorteio/
│   │   │   └── stats/route.ts
│   │   ├── pagamento/              # Integracao Asaas
│   │   ├── debug/                  # Rotas de debug (remover em producao)
│   │   └── webhook/                # Webhooks
│   └── teste-pagamento/            # Teste pagamento
├── lib/
│   └── auth.ts                     # Helpers de auth
├── middleware.ts                   # Auth middleware
├── supabase/
│   └── migrations/
│       └── 20240101000001_rpc_criar_beneficiario.sql
├── public/
│   └── index.html                  # Landing estatica
└── package.json
```

---

## 5. Historico de Problemas Resolvidos (Git)

| Commit | Descricao |
|--------|-----------|
| `e547ff5` | Fix admin login redirect: window.location em vez de router.push |
| `5eea531` | Logout chama API para deletar cookies httpOnly |
| `e52a7c5` | Remover redirecionamento para /login no dashboard (loop infinito) |
| `12b4b7b` | Middleware valida token antes de redirecionar (loop infinito) |
| `8df5ec1` | Salvar token no localStorage apos login (loop infinito) |
| `251854e` | Login API usa anon client para signInWithPassword |
| `99a2bac` | Separar paginas de login admin e beneficiario |
| `3f95e2f` | Fix auth middleware e remover rewrites conflitantes |
| `7ab6400` | Fix JSX quebrado no PagamentoContent |
| `27210b7` | Pagina de login com acesso admin |
| `0de91b4` | Remover auth obrigatoria na rota de pagamento PIX |
| `b4a36b7` | Adicionar campo status no select de beneficiarios |
| `0584aa4` | Corrigir URL base do Asaas (remover /api) |

---

## 6. Problemas Conhecidos / Pendentes

### Em andamento:
- **Admin login redirect**: Fix feito (`window.location.href`) mas PRECISA TESTAR apos deploy Vercel. Se ainda nao funcionar, verificar se os cookies httpOnly estao sendo setados corretamente na response do `/api/auth/login`
- **Unauthorized na API admin/stats**: Arquivo `app/api/admin/stats/` existe mas pode estar sem autenticacao adequada

### Assets pendentes:
- **Rotas debug**: `app/api/debug/` deve ser removido para producao
- **login-v2**: `app/api/auth/login-v2/` e versao alternativa, pode ser removida se login principal funciona
- **teste-pagamento**: Pagina de teste de pagamento deve ser removida para producao

### Modificacoes nao comitadas (working tree):
- `app/admin/page.tsx` - modificado localmente
- `app/api/auth/session/route.ts` - modificado localmente (usa service role admin)
- `lib/auth.ts` - modificado localmente
- `public/index.html` - modificado localmente (WhatsApp number updated)
- `app/api/admin/stats/` - novo, nao rastreado
- `supabase/` - novo, nao rastreado (contem migrations)

---

## 7. Integracoes

### Supabase
- **Auth**: Email/senha, tokens JWT
- **Database**: Tabela `perfis` (id, tipo: admin/beneficiario), tabela beneficiarios
- **Storage**: Bucket para fotos de perfil dos beneficiarios
- **RPC**: `rpc_criar_beneficiario` - funcao SQL para cadastro

### Asaas
- Gateway de pagamento PIX
- Webhook para confirmacao de pagamento
- Endpoints: criacao de cobranca, consulta de status

### WhatsApp
- Numero de contato: 5593992173231
- Link: https://wa.me/5593992173231
- Atualizado em todos os lugares (index.html e componentes)

---

## 8. Conta Admin

- **Email**: benjamim.portela@gmail.com
- **Perfil**: admin (confirmado na tabela perfis)
- **Status**: email verificado no Supabase

---

## 9. Deploy

- **Plataforma**: Vercel
- **Branch**: main
- **Dominios**: futurasaude.com.br (alem do .vercel.app)
- **Auto-deploy**: push para main => build automatico
- **Build time**: ~2 minutos

---

## 10. Template para Proxima Sessao

Para retomar o projeto em uma nova sessao, use:

```
Leia o arquivo /c/projects/futura-saude/CONTEXTO-PROJETO.md e continue de onde paramos.
```

Tarefas prioritarias:
1. Testar login admin apos fix do redirect
2. Comitar modificacoes pendentes (admin/page.tsx, session/route.ts, auth.ts, etc.)
3. Remover rotas de debug e teste para producao
4. Verificar API admin/stats - possivel problema de auth
