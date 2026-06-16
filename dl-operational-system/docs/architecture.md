# Arquitetura — DL Operational System

## Stack
- **Next.js 14 (App Router)** + **TypeScript** estrito.
- **Tailwind CSS** + utilitários `.dl-*` (em `app/globals.css`) e tokens de tema
  (em `tailwind.config.ts`).
- **shadcn/ui** (Radix primitives) para Dialog/Tabs/Slot; componentes próprios em
  `components/ui`.
- **lucide-react** (ícones), **framer-motion** (animações/toasts), **Recharts**
  (gráficos), **dnd-kit** (drag and drop dos boards), **date-fns** (pt-BR).
- **@supabase/supabase-js** preparado (Fase 2). **OpenAI** preparado (Fase 4).

## Organização de pastas
```
app/                 # rotas (App Router)
  (app)/             # route group: páginas internas com AppShell
    <secao>/page.tsx
  login/page.tsx     # fora do group (tela cheia)
  layout.tsx         # root: fonte, metadata, <html> dark
  page.tsx           # redireciona para /dashboard
components/
  layout/            # AppShell, Sidebar, Topbar, PageHeader
  ui/                # primitivos (button, card, dialog, tabs, toast, ...)
  <feature>/         # componentes por domínio (dashboard, boards, clientes, ...)
lib/
  types.ts           # fonte única de tipos do domínio
  mock-data.ts       # TODOS os dados mockados + helpers de leitura
  constants.ts       # marca, labels, mapas de cor/estilo
  routes.ts          # ROUTES + estrutura da navegação
  utils.ts           # cn() + formatadores (datas, moeda, etc.)
  supabase.ts        # client opcional (null se não configurado)
  openai.ts          # contrato do DLtinho + stub (sem chamada real)
database/            # schema.sql + rls-policies.sql (previstos)
docs/                # PMBOK + technical-debt-log
```

### Por que um route group `(app)`?
Mantém URLs idênticas à especificação (ex.: `/dashboard`) e permite que **apenas**
as páginas internas compartilhem a `AppShell` (sidebar + topbar + toasts). O
`/login` fica fora do group e renderiza em tela cheia.

## Padrões de componentes
- **Server por padrão**, `"use client"` só onde há estado/eventos (boards,
  modais, chat, filtros).
- Componentes **pequenos e tipados**; um componente por arquivo.
- **Sem regra de negócio dentro de UI pura**: cores/labels vêm de `constants.ts`;
  dados vêm de `mock-data.ts`.
- **PageHeader** padroniza label + título (com destaque) + subtítulo + ações.
- **Toast `futureFeature`** padroniza o feedback de "integração futura".

## Padrões de dados
- Todo dado mockado vive em `lib/mock-data.ts`, tipado por `lib/types.ts`.
- Helpers de leitura (`getTasksByAssignee`, `getBoardCards`, ...) já têm a
  assinatura que será mantida quando virarem queries Supabase.
- Valores monetários em **centavos** (`spendCents`) para evitar erro de float.

## Como trocar mock-data por Supabase (Fase 2/3)
1. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Aplicar `database/schema.sql` e `database/rls-policies.sql`.
3. Criar uma camada `lib/repositories/*` que implemente as mesmas assinaturas dos
   helpers de `mock-data.ts`, usando `getSupabase()`.
4. Substituir os imports de `mock-data` pelos repositórios (idealmente via uma
   fachada única), mantendo os tipos de retorno.
5. Como `getSupabase()` retorna `null` sem credenciais, é possível manter um
   fallback para mock durante a transição.

## Como a IA (DLtinho) será acoplada (Fase 4)
- `lib/openai.ts` já define `askDLtinho()` e o catálogo `DLTINHO_ACTIONS`.
- Na Fase 4, `askDLtinho` chamará uma **rota server-side** (`app/api/dltinho`)
  que usa `OPENAI_API_KEY` (nunca exposta no client) e retorna `DLtinhoReply`.
- As "ações" (criar cliente, criar tarefa, gerar copy, etc.) serão mapeadas para
  operações reais nos repositórios, com confirmação na UI.

## Conexão com o motor `danz` (Fase 5)
O projeto `danz` (Node/CommonJS) permanece como **motor operacional** (Meta Ads,
Google Sheets, alertas, jobs, histórico). O frontend consumirá suas APIs internas
nas fases de integração. Esse acoplamento está registrado como item de roadmap e
de dívida técnica até existir de fato — nada é apresentado como pronto antes disso.
