# Futura Saúde — Contexto Completo de Sessão

**Data:** 2026-05-14  
**Projeto:** `C:/projects/futura-saude`  
**Stack:** Next.js 14 (App Router) + Supabase + TailwindCSS + Vercel + Google Places API  
**Deploy:** Vercel  

---

## 🏗️ Arquitetura do Projeto

```text
app/
  admin/                  → Painel admin (protegido por requireAdmin)
    especialidades/       → CRUD de especialidades
    clinicas/             → CRUD de clínicas + importação Google Places
    beneficiarios/        → Gestão de beneficiários
    financeiro/           → Painel financeiro
    configuracoes/        → Config do sistema (key-value store)
    sorteio/              → Sistema de sorteio com auditoria criptográfica
  dashboard/              → Painel do beneficiário (pós-login)
    clinicas/             → Lista de clínicas ativas
    carteirinha/          → Carteirinha digital do beneficiário
    agendamentos/         → Agendamentos do beneficiário
    configuracoes/        → Perfil do beneficiário
  api/
    admin/                → APIs do painel admin (requerem requireAdmin)
      especialidades/
      clinicas/
        import-google/    → Busca textual + detalhes via Google Places
      beneficiarios/
      financeiro/
      configuracoes/
      sorteio/
    beneficiario/         → APIs do lado do beneficiário (requerem auth JWT)
      clinicas/
      carteirinha/
      agendamentos/
      perfil/
      foto/
    webhook/pagamento/    → Webhook de pagamento
lib/
  supabase.ts             → supabaseAdmin (service role client)
  auth.ts                 → requireAdmin() helper
  google-places.ts        → integração server-side com Google Places
middleware.ts             → Redirecionamentos pós-cadastro
supabase/migrations/      → migrações SQL
sql/schema.sql            → schema consolidado
APENAS_SQL.sql            → schema alternativo/documental
```

---

## ✅ O que já foi feito (histórico consolidado)

### Commits recentes já existentes
| Hash | Descrição |
|------|-----------|
| `94236bb` | Fix pagamento — maybeSingle, VALOR_PLANO_ANUAL, token obrigatório em prod, ignora PAYMENT_CREATED |
| `78db078` | Webhook dedup com in-memory fallback e SQL migration |
| `3b177ad` | Webhook dedup via Supabase, middleware redirect pós-cadastro, dedup de especialidades |
| `e73bc84` | Fix segurança em 13 rotas de API |
| `cd37517` | Fix 22 bugs no painel admin (páginas e APIs) |

### Sessão anterior — correções e migrações já concluídas
- **Especialidades:** CRUD completo com whitelist de campos, sanitização e validação de `tipo_beneficio`
- **Clínicas:** base do CRUD admin consolidada, upload de logo, toggle de ativo
- **Beneficiários:** POST + `[id]` route com whitelist e segurança
- **Configurações admin:** key-value store com upsert
- **Financeiro:** correção anterior de empty catch block e NaN handling
- **Dashboard clínicas:** migrado para API real
- **Dashboard carteirinha:** migrado para API real

### Sessão atual — financeiro estabilizado em produção
- **Vercel em produção:** confirmado como **Ready**
- **Alias principal confirmado:** `https://futura-saude.vercel.app`
- **Financeiro admin:** loading infinito corrigido
- **Erro 400 do financeiro:** corrigido com ajuste de `created_at` → `criado_em`
- **Paginação real implementada:** lista agora usa `page` + `page_size`
- **Métricas separadas implementadas:** cards do financeiro deixaram de depender da página atual
- **Deploy do financeiro com paginação/métricas:** `dpl_7UnRAegZgGf8YpBrHERiiE6jDQvM`
- **Build local:** `npm run build` passando após as correções

### Sessão atual — nova estratégia de cadastro de clínicas
Foi adotada a estratégia recomendada de **importação semi-automática via Google Places**, substituindo o fluxo antigo baseado em colar URL + scraping frágil.

#### Novo fluxo implementado
1. Admin abre `admin/clinicas`
2. Clica em **Buscar no Google**
3. Digita:
   - nome da clínica ou profissional
   - cidade
   - bairro opcional
   - especialidade
4. Sistema faz **busca textual** no Google Places
5. Admin escolhe o resultado correto em **Usar este resultado**
6. Sistema busca os **detalhes do local**
7. Preview é exibido
8. Admin clica em **Preencher cadastro**
9. Formulário principal é pré-preenchido
10. Admin revisa e salva manualmente

#### O que foi implementado no backend
- Novo helper server-side: `lib/google-places.ts`
- Integração com:
  - **Text Search** do Google Places
  - **Place Details** do Google Places
  - **Place Photos (New)** para preview opcional de imagem pública do Google
- Novo contrato no endpoint `app/api/admin/clinicas/import-google/route.ts`:
  - `mode: "search"`
  - `mode: "details"`
- Novo proxy admin para foto pública do Google:
  - `app/api/admin/clinicas/google-photo/route.ts`
- Persistência de metadados do Google no cadastro da clínica

#### Novos campos adicionados ao modelo de clínicas
- `google_place_id`
- `google_maps_url`
- `website`
- `latitude`
- `longitude`

#### Rotas atualizadas
- `app/api/admin/clinicas/route.ts`
- `app/api/admin/clinicas/[id]/route.ts`
- `app/api/admin/clinicas/import-google/route.ts`
- `app/api/beneficiario/clinicas/route.ts`

#### Frontend admin atualizado
- `app/admin/clinicas/page.tsx`
- O modal de importação agora:
  - busca por texto
  - lista candidatos
  - permite abrir o Maps antes de escolher
  - mostra preview antes de preencher o formulário
  - exibe foto pública do Google como preview opcional quando disponível
- O formulário principal agora também comporta:
  - `website`
  - `google_maps_url`
  - `google_place_id`
  - `latitude`
  - `longitude`
- A foto do Google não é persistida automaticamente em `foto_url`; ela serve como preview transitório antes do upload manual/decisão do admin

#### Arquivos de schema / migração atualizados
- `APENAS_SQL.sql`
- `sql/schema.sql`
- `supabase/migrations/202605120001_add_google_fields_to_clinicas.sql`

#### Variáveis de ambiente preparadas
Em `.env.local.example` foi adicionada:
- `GOOGLE_PLACES_API_KEY`

#### Build após a mudança
- `npm run build` **passou com sucesso** após a implementação do fluxo Google Places

#### Publicação e refinamento final
- `app/admin/clinicas/page.tsx` recebeu refinamento final de microcopy/UX no fluxo de importação
- Commit publicado em `main`: `e4e9bb6` — `feat: add Google Places clinic import flow`
- Deploy de produção confirmado no Vercel como **Ready**
- Alias principal online: `https://futura-saude.vercel.app`

---

## 🔄 O que ainda precisa ser feito

### Alta prioridade
- [ ] **Testar o fluxo completo no admin `/admin/clinicas` com foto opcional do Google**
  - buscar clínica
  - selecionar resultado
  - validar preview com e sem foto
  - confirmar preview
  - salvar
  - validar persistência no banco
- [ ] **Executar smoke test do dashboard/agendamentos com dados reais**
  - validar carregamento
  - validar cancelamento
  - validar estados vazios/erro

### Média prioridade
- [ ] **Botões da carteirinha** (Download PDF, Compartilhar, Modo Offline) — ainda placeholders
- [ ] **Teste E2E do fluxo principal**
  - cadastro → pagamento → login → dashboard → carteirinha → clínicas

### Baixa / futura evolução
- [ ] Sugerir especialidade automaticamente por categoria do Google
- [ ] Mapear serviços ofertados manualmente no cadastro
- [ ] Exibir link Google Maps no app do beneficiário na UI, se desejado
- [ ] Usar latitude/longitude para mapa ou proximidade futuramente

---

## 🗄️ Schema das tabelas principais

### `especialidades`
| Coluna | Tipo |
|--------|------|
| id | uuid |
| nome | text |
| icone_emoji | text |
| icone_url | text \| null |
| tipo_beneficio | `'gratuito' \| 'desconto' \| 'avaliacao'` |
| descricao_beneficio | text |
| visivel_beneficiario | boolean |
| ativo | boolean |
| criado_em | timestamp |

### `clinicas`
| Coluna | Tipo |
|--------|------|
| id | uuid |
| nome_clinica | text |
| nome_profissional | text \| null |
| especialidade_id | uuid (FK → especialidades) |
| registro_profissional | text |
| foto_url | text \| null |
| endereco | text |
| bairro | text |
| cidade | text |
| whatsapp | text |
| horario | text |
| avaliacao | numeric |
| total_agendamentos | int |
| ativo | boolean |
| google_place_id | text \| null |
| google_maps_url | text \| null |
| website | text \| null |
| latitude | float8 \| null |
| longitude | float8 \| null |
| criado_em | timestamp |

### `beneficiarios`
| Coluna relevante | Tipo |
|--------|------|
| id | uuid |
| responsavel_id | uuid (FK → auth.users/perfis) |
| nome / nome_completo | text |
| cpf | text |
| data_nascimento | date |
| numero_cartao / numero_carteirinha | text |
| plano_inicio | date |
| plano_fim | date |
| status | text |
| score / score_engajamento | int |

### `perfis`
| Coluna | Tipo |
|--------|------|
| id | uuid (= auth.users.id) |
| nome_completo | text |
| email | text |
| whatsapp | text |
| cidade | text |
| bairro | text |
| cep | text |

---

## 🔐 Autenticação
- **Admin:** `requireAdmin(request)` em `lib/auth.ts`
- **Beneficiário:** Bearer token no header `Authorization` ou cookie `sb-access-token`
- **Supabase client:** `supabaseAdmin` (service role)

---

## 🌐 Integração Google Places

### Chave configurada
```env
GOOGLE_PLACES_API_KEY=sua_chave_aqui
```

- Variável configurada no Vercel em Production/Preview
- Places API (New) ativada no Google Cloud

### Fluxo técnico
- Busca textual: `searchGooglePlaces()`
- Detalhes: `getGooglePlaceDetails()`
- Arquivo principal: `lib/google-places.ts`

### Observações
- A importação **não salva automaticamente**
- O admin sempre revisa no formulário antes de salvar
- `serviços ofertados` ainda **não** são importados automaticamente
- O campo `especialidade_id` continua manual/obrigatório
- `nome_profissional` é opcional
- Foto pública do Google é usada apenas como preview opcional, não como imagem definitiva automática

---

## 🛠️ Comandos úteis

```bash
# Rodar localmente
cd C:/projects/futura-saude
npm run dev

# Build
npm run build

# Git status
git status
git log --oneline -10

# Deploy (automático via Vercel no push para main)
git push origin main
```

### SQL da migration nova
```sql
ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS latitude FLOAT8,
  ADD COLUMN IF NOT EXISTS longitude FLOAT8;

CREATE INDEX IF NOT EXISTS idx_clinicas_google_place_id
  ON public.clinicas(google_place_id);
```

---

## 📁 Arquivos-chave modificados recentemente

| Arquivo | Status |
|---------|--------|
| `app/dashboard/clinicas/page.tsx` | ✅ Migrado para API real |
| `app/dashboard/carteirinha/page.tsx` | ✅ Migrado para API real |
| `app/dashboard/agendamentos/page.tsx` | ✅ Ligado à API real e refinado com ordenação/estados reais |
| `app/api/beneficiario/clinicas/route.ts` | ✅ Join com especialidades + agora expõe `google_maps_url` e `website` |
| `app/admin/clinicas/page.tsx` | ✅ Refatorado para busca Google Places |
| `app/api/admin/clinicas/import-google/route.ts` | ✅ Refeito para `search` + `details` |
| `app/api/admin/clinicas/route.ts` | ✅ Suporte aos novos campos Google |
| `app/api/admin/clinicas/[id]/route.ts` | ✅ Suporte aos novos campos Google |
| `lib/google-places.ts` | ✅ Novo helper server-side |
| `supabase/migrations/202605120001_add_google_fields_to_clinicas.sql` | ✅ Nova migration |
| `APENAS_SQL.sql` | ✅ Atualizado |
| `sql/schema.sql` | ✅ Atualizado |
| `.env.local.example` | ✅ Atualizado com `GOOGLE_PLACES_API_KEY` |

---

## 📌 Situação atual resumida
- Produção Vercel está **Ready**
- Alias principal `https://futura-saude.vercel.app` está apontando para o deploy atual
- Build local está **passando**
- Fluxo novo de clínicas via Google Places está **implementado no código** e **publicado em produção**
- Google Places está configurado no Vercel e operacional
- Preview opcional de foto pública do Google foi integrado ao fluxo de clínicas
- `nome_profissional` agora é opcional no banco de produção
- Financeiro admin foi corrigido, paginado e publicado
- Dashboard/agendamentos já usa API real e foi refinado
- Ainda falta:
  - validar smoke test final do fluxo de clínicas com foto opcional
  - validar smoke test do dashboard/agendamentos
  - evoluções futuras da carteirinha e fluxo E2E

---

*Atualizado em 2026-05-14 com financeiro estabilizado/publicado, Google Places operacional, preview opcional de foto do Google, nome_profissional opcional no banco e refinamento do dashboard de agendamentos.*
