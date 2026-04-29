# Plano de Migração Next.js 14 → 16

**Status atual:** `next@14.2.35` (último patch da linha 14.x)
**Pendente:** 2 advisories de segurança só fecham com Next.js 16+

## Vulnerabilidades restantes

| ID | Severidade | Descrição | Impacto |
|---|---|---|---|
| [GHSA-h25m-26qc-wcjf](https://github.com/advisories/GHSA-h25m-26qc-wcjf) | Alta | DoS via deserialização de HTTP request com RSC | DoS direcionado |
| [GHSA-3x4c-7xq6-9pq8](https://github.com/advisories/GHSA-3x4c-7xq6-9pq8) | Moderada | Cache de imagem ilimitado pode esgotar disco | DoS por exaustão |

## Breaking changes esperados (14 → 15 → 16)

### Next 15
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` agora retornam `Promise`
  - Impacto neste projeto: `app/api/admin/beneficiarios/[id]/route.ts` (já usa `await Promise.resolve(params)`, mas precisa virar `await params`)
  - Buscar usos: `cookies()`, `headers()` em todas as routes
- **React 19**: requer atualização de `@types/react` e libs UI
  - Impacto: `lucide-react` precisa de versão compat com React 19
- **Caching defaults mudaram**: `fetch()` não cacheia por default
- `next/font` movido pra `next/font` (já estava em 14)

### Next 16
- **Node.js 18.18+ obrigatório** (atual: Node 24 — OK)
- **Removido**: `next/legacy/image`, `legacyBehavior` em `Link`, `swcMinify` config
- **Turbopack** padrão para `next dev`
- **CSP nonces**: melhor suporte (vai exigir revisar `next.config.js` headers)

## Checklist de upgrade

```
□ 1. Backup do projeto + branch isolada
□ 2. Atualizar para Next 15 primeiro
   npm install next@15 react@19 react-dom@19 @types/react@19 @types/react-dom@19
□ 3. Rodar codemod oficial:
   npx @next/codemod@canary upgrade latest
□ 4. Auditar params/searchParams/cookies/headers — todos viram async
□ 5. Auditar fetch() — adicionar `cache: 'force-cache'` onde precisava cache
□ 6. Atualizar lucide-react para versão React-19-compat
□ 7. npm run build — corrigir todos os type errors
□ 8. Testar em dev: login, dashboard, admin, pagamento
□ 9. Deploy preview na Vercel — validar
□ 10. Subir para Next 16:
    npm install next@16
□ 11. Re-rodar codemod, build, deploy preview
□ 12. Smoke tests + promover para produção
```

## Estimativa
- Tempo: 2-4h se a base for pequena (este projeto: 23 routes API + ~10 páginas)
- Risco: médio — Supabase auth-helpers pode precisar de versão nova
- Recomendação: fazer em sprint dedicado, não junto com features

## Quando fazer
- ✅ Imediato se: site sob ataque DoS ativo
- 🟡 Em até 30 dias se: tráfego >10k req/dia
- 🟢 Em backlog se: tráfego baixo + sem stakeholder de risco

Por enquanto a versão **14.2.35** é segura para o caso de uso atual (carteira de saúde com tráfego previsto baixo).
