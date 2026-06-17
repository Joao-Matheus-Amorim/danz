# DL Operational System

Central operacional interna da **DL (Dental Lead)**: um mini sistema operacional
da agencia que reune, num unico workspace: **Dashboard**, IA **DLtinho**,
**Meu Painel**, **Boards** estilo Trello, **Clientes**, **Calendario**,
**Briefings**, **Campanhas**, **Drive/Documentos/Planilhas**, **Inbox WhatsApp**
e **Configuracoes**.

> **Estado atual:** o MVP visual continua funcionando sem envs em modo mock, mas
> a Fase 2 ja tem Supabase Auth/schema/RLS/seed e a Fase 3 ja persiste clientes
> e boards via Supabase. O primeiro corte Trello tambem esta preparado por rotas
> server-side, aguardando as envs reais do Trello.

## Stack
Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix),
lucide-react, framer-motion, Recharts, dnd-kit, date-fns (pt-BR),
Supabase Auth/Database e OpenAI preparado.

## Como Rodar
```bash
npm install
npm run dev      # http://localhost:3000 -> redireciona para /dashboard
```

O app funciona sem variaveis de ambiente em modo mock. Para ligar Supabase e
Trello, copie `.env.example` para `.env.local` e preencha as chaves necessarias.

Scripts:
```bash
npm run dev        # desenvolvimento
npm run build      # build de producao
npm run start      # servir build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Estrutura
```text
app/                # rotas App Router, incluindo app/api/trello/*
components/         # layout, ui e componentes por dominio
lib/                # types, mock-data, repositories, constants, routes, supabase, openai
lib/integrations/   # codigo legado real colhido do danz, a portar em cortes futuros
database/           # schema.sql, rls-policies.sql, seed.sql, trello-sync.sql
docs/               # PMBOK, ADR, setup, roadmap, dividas e integracoes
vercel.json         # framework=nextjs
```

## Deploy
Publicado na Vercel com Next.js e root na raiz do repo. Cada push na `main`
republica automaticamente. Chaves sensiveis ficam em variaveis de ambiente e
rotas server-side; `.env.local` nao deve ser versionado.

## Roadmap
1. **MVP visual navegavel**: concluido.
2. **Supabase**: Auth, schema, RLS e seed preparados.
3. **CRUD real**: clientes e boards ja usam Supabase; demais superficies seguem
   por cortes.
4. **IA DLtinho**: OpenAI server-side e acoes reais.
5. **Integracoes**: Trello iniciado; Meta, Google e WhatsApp seguem pendentes.
6. **Permissoes e operacao multiusuario**: RBAC, convites e auditoria ativa.

Detalhes completos em [`docs/`](./docs).

## Supabase
O repo contem Auth client-side, guard de sessao, schema/RLS e seed inicial.
Para ligar em um projeto real, veja [`docs/supabase-setup.md`](./docs/supabase-setup.md).

## Trello Sync
O primeiro corte Trello importa boards/listas/cards para o banco via rota
server-side e faz envio controlado de cards criados ou movidos em listas vindas
do Trello. Configure `TRELLO_API_KEY`, `TRELLO_API_TOKEN` e `TRELLO_BOARD_ID`;
se o banco ja existe, rode `database/trello-sync.sql`. Detalhes em
[`docs/trello-sync.md`](./docs/trello-sync.md).

## Legado `danz`
Este repositorio comecou como `danz` e foi consolidado no app atual. A parte
com valor real do legado, as integracoes que chamam APIs externas, foi
preservada em [`lib/integrations/`](./lib/integrations) e sera portada para
rotas server-side TypeScript em cortes futuros.
