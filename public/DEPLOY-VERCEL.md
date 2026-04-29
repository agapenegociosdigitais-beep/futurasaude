# 🚀 FUTURA SAÚDE — Deploy na Vercel

## COMANDOS PARA RODAR NO TERMINAL (PowerShell)

### PASSO 1 — Conectar ao GitHub
```
cd C:\projects\futura-saude
git remote add origin https://github.com/agapenegociosdigitais-beep/futurasaude.git
git branch -M main
git push -u origin main
```

### PASSO 2 — Instalar Vercel CLI
```
npm install -g vercel
```

### PASSO 3 — Fazer o Deploy
```
vercel --yes
```

### PASSO 4 — Configurar variáveis de ambiente na Vercel
Após o deploy, acesse vercel.com → seu projeto → Settings → Environment Variables
e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://fqdhapwfvmmjpzqbkxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
NEXT_PUBLIC_APP_URL=https://futurasaude.vercel.app
NEXT_PUBLIC_WHATSAPP_SUPORTE=5593992173231
GATEWAY_ATIVO=asaas
```

### PASSO 5 — Redesploy após variáveis
```
vercel --prod
```

---

## COMO ATUALIZAR O SITE DEPOIS

Toda vez que fizer uma alteração:
```
cd C:\projects\futura-saude
git add .
git commit -m "descricao da alteracao"
git push
```
O site atualiza automaticamente em 1-2 minutos! ✅

---

## LINKS IMPORTANTES
- GitHub: https://github.com/agapenegociosdigitais-beep/futurasaude
- Vercel: https://vercel.com
- Supabase: https://app.supabase.com/project/fqdhapwfvmmjpzqbkxws
