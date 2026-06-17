# DL Operational System

Central operacional interna da **DL (Dental Lead)** — um "mini sistema operacional"
da agência que reúne, num único workspace: **Dashboard**, IA **DLtinho**, **Meu
Painel**, **Boards** (estilo Trello), **Clientes** (CRM), **Calendário**,
**Briefings**, **Campanhas** (Meta Ads), **Drive/Documentos/Planilhas**, **Inbox
WhatsApp** e **Configurações**.

> **Fase 1 — MVP visual navegável.** Todos os dados são mockados e centralizados em
> `lib/mock-data.ts`. Nenhuma integração externa é real ainda; botões sem ação real
> exibem um aviso claro de "integração futura". Veja `docs/` para escopo, riscos,
> arquitetura e o registro de dívidas técnicas.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) ·
lucide-react · framer-motion · Recharts · dnd-kit · date-fns (pt-BR) ·
Supabase (preparado) · OpenAI (preparado).

## Como rodar
```bash
npm install
npm run dev      # http://localhost:3000  → redireciona para /dashboard
```
O app funciona **sem variáveis de ambiente** (modo mock). Para preparar as fases
futuras, copie `.env.example` para `.env.local`.

Scripts:
```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servir build
npm run lint       # eslint (next)
npm run typecheck  # tsc --noEmit
```

## Estrutura
```
app/            # rotas (route group (app) compartilha a AppShell; /login fora dele)
components/     # layout, ui (primitivos) e componentes por domínio
lib/            # types, mock-data, constants, routes, utils, supabase, openai
lib/integrations/  # código real colhido do danz (Meta/Sheets) — a portar na Fase 5
database/       # schema.sql + rls-policies.sql + seed.sql (Supabase)
docs/           # PMBOK + ADR (charter, scope, requirements, architecture, data-model,
                #             risk-register, quality-plan, roadmap, technical-debt-log,
                #             adr-0001)
vercel.json     # framework=nextjs (deploy)
```

## Deploy
Publicado na Vercel (Next.js, Root Directory = raiz do repo). Cada push na `main`
republica automaticamente. O app sobe **sem variáveis de ambiente** (modo mock);
as chaves das fases futuras (Supabase/OpenAI/integrações) ficam só no servidor.

## Identidade visual
Tema escuro premium: fundo preto esverdeado (`#050A07`), neon verde-limão
(`#B6FF00`) como cor principal, glassmorphism leve, brilhos radiais e labels com
letter-spacing. Tokens em `tailwind.config.ts`; utilitários `.dl-*` em
`app/globals.css`.

## Legado `danz` (erradicado)
Este repositório começou como `danz` (protótipo Node/CommonJS com dados mock).
Ele foi **erradicado** em favor deste app, que agora é a raiz do repositório
(ver [`docs/adr-0001-unificacao-front-back.md`](./docs/adr-0001-unificacao-front-back.md)).
A única parte com valor real do `danz` — as integrações que chamam APIs externas
de verdade — foi preservada em [`lib/integrations/`](./lib/integrations) e será
portada para rotas server-side TypeScript na **Fase 5**.

## Roadmap (resumo)
1. **MVP visual navegável** ✅
2. Supabase (auth + schema/RLS)
3. CRUD real (repositórios)
4. IA DLtinho (OpenAI server-side + ações)
5. Integrações (Meta/Google/WhatsApp/Trello — portando `lib/integrations/`)
6. Permissões e operação multiusuário

Detalhes completos em [`docs/`](./docs).

## Supabase (Fase 2)
O repo ja contem Auth client-side, guard de sessao, schema/RLS e seed inicial.
Para ligar em um projeto real, veja [`docs/supabase-setup.md`](./docs/supabase-setup.md).
