# 🧪 Guia de Teste — Usuários Futura Saúde

## 📋 Dados de Teste

### Admin
- **Email:** `admin@futuraude.test`
- **Senha:** `QuickTest123!`
- **Nome:** Maria Silva — Admin
- **Tipo:** Administrator
- **Acesso:** Painel admin em `/admin`

### Beneficiário (Responsável)
- **Email:** `joao@futuraude.test`
- **Senha:** `QuickTest123!`
- **Nome:** João Carlos Silva
- **CPF:** 98765432100
- **Tipo:** Responsável Financeiro
- **Acesso:** Dashboard em `/dashboard`

### Beneficiário (Filho/Filha)
- **Nome:** Pedro Carlos Silva
- **CPF:** 45678912300
- **Data Nascimento:** 15/03/2007
- **Parentesco:** Filho
- **Status:** Ativo
- **Plano:** Até 2027

---

## 🔧 Como Configurar

### Opção 1: Script Automático (Recomendado)

1. **Abra o Supabase** → Vá em `SQL Editor`
2. **Cole o conteúdo** de `TEST_USERS.sql`
3. **Execute** (clique em "Run" ou Ctrl+Enter)
4. ✅ Pronto! Usuários serão criados automaticamente

### Opção 2: Manual (Se O Anterior Não Funcionar)

#### Passo 1: Criar Admin Manualmente
- Vá em **Authentication → Users**
- Clique **"Add user"**
- Email: `admin@futuraude.test`
- Password: `QuickTest123!`
- Confirm password
- Clique **"Create user"**
- **Copie o UUID** do usuário criado

#### Passo 2: Executar SQL Manual
1. Abra `TESTE_SIMPLES.sql`
2. Na linha onde diz `'xxx-seu-uuid-aqui'::UUID`, **cole o UUID do admin**
3. Crie outro usuário: `joao@futuraude.test` / `QuickTest123!`
4. Na segunda inserção, **cole o UUID do João**
5. Execute todas as queries em ordem

#### Passo 3: Verificar Dados
Execute as queries de verificação final para confirmar

---

## 🧪 Testando as Páginas

### Dashboard (Beneficiário)
```
URL: http://localhost:3004/dashboard
Email: joao@futuraude.test
Senha: QuickTest123!
```

**O que testar:**
- ✅ Login com email/senha
- ✅ Sidebar navega entre abas (Início, Carteirinha, Clínicas)
- ✅ Cards mostram dados: Beneficiário (Pedro), Consultas (3), Clínicas (40)
- ✅ Carteirinha virtual renderiza com gradiente azul
- ✅ Responsividade mobile (☰ menu toggle)

### Admin (Painel Administrativo)
```
URL: http://localhost:3004/admin
Email: admin@futuraude.test
Senha: QuickTest123!
```

**O que testar:**
- ✅ Login com credenciais admin
- ✅ Dashboard mostra 4 cards: Usuários (1.250), Receita (R$ 84.5k), Clínicas (180), Consultações
- ✅ Abas funcionam: Dashboard, Usuários, Pagamentos, Clínicas
- ✅ Tabelas exibem dados com status badges
- ✅ Sidebar collapsável em mobile

### Pagamento
```
URL: http://localhost:3004/pagamento
```

**O que testar:**
- ✅ Alternar entre PIX e Cartão de Crédito
- ✅ PIX: código visível, botão "Copiar" funciona
- ✅ Cartão: inputs aceitam dados, botão Processar

---

## 📊 Estrutura de Dados

### Tabelas Criadas
- **perfis** — Admin + Beneficiário (Responsável)
- **beneficiarios** — Pedro (filho do João)
- **especialidades** — Odontologia, Psicologia, Oftalmologia
- **clinicas** — 3 clínicas de teste
- **agendamentos** — 1 agendamento confirmado

### UUIDs Gerados Automaticamente
- Admin ID: `{uuid aleatorório}`
- João ID: `{uuid aleatorório}`
- Pedro (beneficiário): `{uuid aleatorório}`

---

## 🔐 Segurança RLS (Row Level Security)

As políticas estão ativas:
- ✅ **Usuário vê**: sua própria carteira + perfil
- ✅ **Admin vê**: tudo (usuários, pagamentos, clínicas)
- ✅ **Beneficiário**: só seus agendamentos e dados

---

## 🐛 Troubleshooting

### "CPF já existe"
→ CPF duplicado foi inserido. Execute `SELECT * FROM perfis WHERE cpf = '...';` e delete se necessário.

### "Email já existe"
→ Usuário auth já criado. Delete em **Authentication → Users** e tente novamente.

### "Erro de sequência cartao_seq"
→ Já foi criada na primeira execução, ignorar aviso é normal.

### RLS policy bloqueando inserts
→ Execute com `service_role` (secret key) ou disable RLS temporariamente durante testes.

---

## 📝 Dados Adicionais de Teste

Clínicas cadastradas:
| Nome | Especialidade | Whatsapp |
|------|---------------|----------|
| Clínica OralVida | Odontologia | (93) 99999-0001 |
| Instituto Mente Saudável | Psicologia | (93) 99999-0002 |
| VisãoClara Ótica & Saúde | Oftalmologia | (93) 99999-0003 |

---

## ✅ Checklist Final

- [ ] Executou TEST_USERS.sql ou TESTE_SIMPLES.sql
- [ ] Dois usuários aparecem em Authentication → Users
- [ ] Fez login em `/dashboard`
- [ ] Fez login em `/admin`
- [ ] Cards e tabelas carregam dados
- [ ] Sidebar funciona em desktop e mobile
- [ ] Abas naveguem corretamente

**Pronto para testar! 🚀**
