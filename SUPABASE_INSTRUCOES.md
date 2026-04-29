# 🗄️ Configuração do Supabase - Futura Saúde

## Passo 1: Criar Projeto Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Project name:** `futura-saude`
   - **Database password:** Gere uma senha forte (recomendamos usar o gerador)
   - **Region:** Selecione a região mais próxima do Brasil (São Paulo recomendado)
   - **Pricing plan:** Free (Gratuito)
4. Clique em **"Create new project"**
5. Aguarde 3-5 minutos para que o projeto seja criado

## Passo 2: Copiar Credenciais

Após o projeto ser criado:

1. Vá para **Settings** (engrenagem no canto inferior esquerdo)
2. Clique em **"API"** no menu esquerdo
3. Copie e guarde estas informações (você precisará delas depois):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Passo 3: Executar o SQL

1. No Supabase, clique em **"SQL Editor"** (no menu esquerdo)
2. Clique em **"New Query"**
3. **Cole TODO o SQL abaixo** (Ctrl+A para selecionar tudo, depois Ctrl+V para colar):

```sql
-- [COLE O CONTEÚDO DO ARQUIVO SUPABASE_SETUP.sql AQUI]
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde a conclusão (2-3 minutos)
6. Você verá a mensagem: **"Success. No rows returned"**

## Passo 4: Verificar Tabelas Criadas

Para garantir que tudo foi criado corretamente:

1. Clique em **"Table Editor"** (no menu esquerdo)
2. Você deve ver estas 9 tabelas:
   - ✅ acessos_dashboard
   - ✅ agendamentos
   - ✅ beneficiarios
   - ✅ clinicas
   - ✅ configuracoes
   - ✅ especialidades
   - ✅ pagamentos
   - ✅ perfis
   - ✅ sorteios

3. Clique em cada tabela para verificar as colunas

## Passo 5: Atualizar .env.local

No arquivo `.env.local` da sua aplicação Next.js, atualize com os valores copiados no Passo 2:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

## Passo 6: Configurar Autenticação (Email)

1. No Supabase, vá para **Authentication** (no menu esquerdo)
2. Clique em **"Providers"**
3. Ative o provedor **"Email"** (já vem ativado por padrão)
4. Customize as mensagens em **"Email Templates"** se desejar

## Passo 7: Configurar CORS (Opcional, mas recomendado)

Se você tiver um domínio específico:

1. Vá em **Settings → API**
2. Scroll até **"CORS"**
3. Adicione seu domínio na whitelist

Para desenvolvimento local, você pode deixar como padrão.

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] 9 tabelas visíveis no Table Editor
- [ ] Credenciais copiadas para `.env.local`
- [ ] Banco está pronto para usar!

## 🚀 Próximos Passos

Agora que o Supabase está configurado:

1. Instale as dependências (já feito)
2. Configure o `.env.local` com as credenciais
3. Rode `npm run dev` localmente
4. Teste o cadastro, login e pagamento
5. Deploy na Vercel quando estiver tudo funcionando

## 📋 Detalhes do Schema

### Estrutura de Dados:

#### 1. **perfis** (usuários)
- Armazena responsáveis financeiros e admins
- Relacionado com auth.users do Supabase

#### 2. **beneficiarios** (dependentes)
- Filhos, cônjuges, dependentes do responsável
- Cada um recebe um número de cartão (FS-2025-00042)

#### 3. **especialidades**
- Dentista, Psicólogo, Oftalmologista, etc.
- 8 especialidades padrão já inseridas

#### 4. **clinicas**
- Profissionais parceiros
- Estruturados por especialidade e cidade

#### 5. **pagamentos**
- Registro de transações via PIX / Cartão
- Integração com Asaas, MercadoPago, PagSeguro

#### 6. **agendamentos**
- Solicitação de consultas
- Rastreia status (solicitado, confirmado, realizado, cancelado)

#### 7. **acessos_dashboard**
- Log de acessos para relatórios
- Ajuda a medir engajamento

#### 8. **sorteios**
- Registro de sorteios realizados
- Auditável com hash para segurança

#### 9. **configuracoes**
- Configurações globais do sistema
- Preço, vagas, etc.

## 🔒 Segurança - RLS (Row Level Security)

Todas as tabelas têm segurança de linha habilitada:

- **Beneficiário** vê apenas seus dados
- **Admin** vê todos os dados
- **Público** vê apenas especialidades e clínicas ativas
- Todas as operações respeitam `auth.uid()`

## ❓ Troubleshooting

### Erro: "relation already exists"
- Isso significa que as tabelas já foram criadas
- Delete o projeto e recrie, OU
- Modifique o SQL removendo as linhas que causam erro

### Erro: "permission denied"
- Verifique se você está logado
- Verifique se o projeto está ativo

### Tabelas não aparecem?
- Clique em **"Refresh"** (ícone de seta)
- Ou recarregue a página (F5)

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação oficial: [https://supabase.com/docs](https://supabase.com/docs)
2. Consulte o Discord do Supabase
3. Revise o SQL Editor para mensagens de erro
