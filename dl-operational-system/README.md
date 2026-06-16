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
database/       # schema.sql + rls-policies.sql (previstos p/ Supabase)
docs/           # PMBOK: charter, scope, requirements, architecture, data-model,
                #        risk-register, quality-plan, roadmap, technical-debt-log
```

## Identidade visual
Tema escuro premium: fundo preto esverdeado (`#050A07`), neon verde-limão
(`#B6FF00`) como cor principal, glassmorphism leve, brilhos radiais e labels com
letter-spacing. Tokens em `tailwind.config.ts`; utilitários `.dl-*` em
`app/globals.css`.

## Relação com o motor `danz`
Este frontend vive em `dl-operational-system/`, ao lado do projeto **`danz`**
(motor operacional Node/CommonJS: Meta Ads, Google Sheets, alertas, histórico,
jobs). A integração entre os dois é planejada para a **Fase 5** (ver
`docs/roadmap.md` e `docs/technical-debt-log.md`, TD09) — nada é apresentado como
pronto antes de existir de fato.

## Roadmap (resumo)
1. **MVP visual navegável** ✅
2. Supabase (auth + schema/RLS)
3. CRUD real (repositórios)
4. IA DLtinho (OpenAI server-side + ações)
5. Integrações (Google/WhatsApp/Meta/Trello + ponte `danz`)
6. Permissões e operação multiusuário

Detalhes completos em [`docs/`](./docs).
