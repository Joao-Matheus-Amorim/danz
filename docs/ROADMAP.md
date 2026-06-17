# Roadmap - DL Operational System

## Fase 1 - MVP visual navegavel - entregue
Frontend SaaS completo, navegavel, fiel a identidade, com dados mockados
centralizados, tipos, rotas e estrutura pronta para banco e IA. Docs PMBOK e
registro de dividas tecnicas.

## Fase 2 - Supabase
- Criar projeto Supabase; configurar env (`NEXT_PUBLIC_SUPABASE_*`).
- Aplicar `database/schema.sql` e `database/rls-policies.sql`.
- Implementar Supabase Auth (substituir login simbolico).
- Seed inicial a partir do mock-data.

Status local:
- Supabase Auth ligado ao `/login` quando `NEXT_PUBLIC_SUPABASE_*` existe.
- Rotas internas protegidas por guard de sessao client-side no `AppShell`.
- `database/seed.sql` criado a partir dos principais dados de `lib/mock-data.ts`.
- Guia operacional em `docs/supabase-setup.md`.
- Pendente fora do repo: criar projeto Supabase, aplicar SQLs e preencher `.env.local`.

## Fase 3 - CRUD real
- Camada `lib/repositories/*` com as assinaturas dos helpers do mock-data.
- Substituir leituras/escritas mock por banco (clientes, boards, tarefas,
  calendario, briefings, campanhas, arquivos, inbox).
- Persistir DnD dos boards, criacao de cliente/evento/tarefa.

Status local:
- `lib/repositories/clients.ts`: leitura e criacao real de clientes via Supabase.
- `lib/repositories/boards.ts`: leitura de quadros/colunas/cards, criacao de quadro,
  criacao de card e persistencia de DnD via Supabase.
- Pendentes da Fase 3: tarefas, calendario, briefings, campanhas, arquivos e inbox.

## Fase 4 - IA DLtinho
- Rota server-side `app/api/dltinho` usando `OPENAI_API_KEY`.
- Implementar `askDLtinho` real e execucao das `DLTINHO_ACTIONS`
  (criar cliente/tarefa, gerar copy, resumir cliente, metricas, relatorio).
- Persistir conversas (`chat_conversations` / `chat_messages`).

## Fase 5 - Integracoes externas
- **Meta Ads:** portar `lib/integrations/meta-ads.legacy.js` para rota
  server-side TS (`app/api/meta/...`); dados reais de campanhas.
- **Google Sheets/Docs/Drive:** portar `lib/integrations/google-sheets.legacy.js`
  e adicionar OAuth + embed/edicao.
- **WhatsApp** via provedor homologado (Evolution API / Z-API / Baileys).
- **Trello** (sincronizar boards).

Status local:
- Trello -> DL iniciado via `/api/trello/sync`, usando `TRELLO_API_KEY`,
  `TRELLO_API_TOKEN` e `TRELLO_BOARD_ID`.
- Importacao nao destrutiva de board/listas/cards para `boards`,
  `board_columns` e `board_cards`.
- Pendentes: criacao de boards/listas no Trello, webhooks,
  labels/membros/checklists completos.

> Nota: o prototipo `danz` foi erradicado (ver `adr-0001`). A unica parte
> reaproveitavel - as integracoes reais - foi colhida para `lib/integrations/`
> e sera portada aqui. Nao ha mais "ponte com o danz".

## Fase 6 - Permissoes e multiusuario
- RBAC por papel (owner/admin/gestor/operador) refinando as RLS.
- Convites de usuario, gestao de membros, auditoria ativa (`activity_logs`).
- Notificacoes reais e busca global.
