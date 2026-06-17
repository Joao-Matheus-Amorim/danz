# Arquitetura - DL Operational System

## Stack
- Next.js 14 (App Router) + TypeScript estrito.
- Tailwind CSS + utilitarios `.dl-*` em `app/globals.css`.
- shadcn/ui/Radix primitives para Dialog, Tabs e Slot.
- lucide-react, framer-motion, Recharts, dnd-kit e date-fns pt-BR.
- Supabase Auth/Database para a Fase 2 e os primeiros cortes da Fase 3.
- OpenAI preparado para a Fase 4.

## Organizacao de Pastas
```text
app/
  (app)/             # paginas internas com AppShell
  api/trello/        # rotas server-side Trello
  login/page.tsx     # login fora do shell
components/
  layout/            # AppShell, Sidebar, MobileNav, Topbar, PageHeader
  ui/                # primitivos visuais
  <feature>/         # componentes por dominio
lib/
  repositories/      # leituras/escritas reais por dominio
  mock-data.ts       # fallback e dados ainda nao migrados
  types.ts           # fonte unica de tipos do dominio
  constants.ts       # marca, labels e mapas visuais
  routes.ts          # estrutura de navegacao
  supabase.ts        # client opcional
  openai.ts          # contrato do DLtinho
  integrations/      # legado real colhido do danz, fora do build
database/
  schema.sql
  rls-policies.sql
  seed.sql
  trello-sync.sql
docs/
```

## Shell e Rotas
A `Sidebar` fixa aparece a partir de `lg`; abaixo disso a navegacao vem de
`MobileNav`. O route group `(app)` mantem URLs como `/dashboard` e permite que
as paginas internas compartilhem a `AppShell`. O `/login` fica fora do group.

## Padroes de Componentes
- Server Components por padrao; `"use client"` apenas onde ha estado, eventos,
  drag and drop, dialogos ou integracao client-side com Supabase.
- UI pura nao carrega regra de negocio. Dados reais entram por
  `lib/repositories/*`; dados ainda nao migrados continuam em `lib/mock-data.ts`.
- `PageHeader` padroniza label, titulo, subtitulo e acoes.
- `futureFeature` continua reservado para botoes sem acao real.

## Padroes de Dados
- `lib/types.ts` e `database/schema.sql` devem evoluir juntos.
- Toda tabela de dominio tem `workspace_id` para multi-tenant e RLS.
- Valores monetarios usam centavos (`bigint` no banco).
- Clientes e boards ja usam repositorios Supabase.
- Tarefas, calendario, briefings, campanhas, arquivos e inbox ainda podem usar
  mock/fallback ate os proximos cortes da Fase 3.

## Supabase
O app usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` quando
configurados. Sem essas envs, o fluxo local continua em modo mock para manter o
MVP navegavel.

Para um projeto novo:
1. Aplicar `database/schema.sql`.
2. Aplicar `database/rls-policies.sql`.
3. Criar o usuario inicial no Supabase Auth.
4. Ajustar e executar `database/seed.sql`.

## Trello
O corte Trello vive em rotas server-side:
- `app/api/trello/sync/route.ts`: importa board/listas/cards do Trello para o DL.
- `app/api/trello/cards/push/route.ts`: envia criacao/movimento de card para o
  Trello quando o card pertence a uma lista importada.

As credenciais `TRELLO_API_KEY`, `TRELLO_API_TOKEN` e `TRELLO_BOARD_ID` ficam
somente no servidor. O mapeamento usa `external_id` em `boards`,
`board_columns` e `board_cards`.

## DLtinho
`lib/openai.ts` define o contrato do DLtinho. Na Fase 4, as chamadas OpenAI
devem passar por rota server-side e acionar repositorios reais com confirmacao
na UI.

## Integracoes Legadas
O prototipo `danz` foi consolidado neste app. A parte real dele, Meta Ads e
Google Sheets, esta preservada em `lib/integrations/*.legacy.js`. Esses modulos
seguem fora do build e serao portados para rotas TypeScript server-side em
cortes futuros.
