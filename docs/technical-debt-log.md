# Registro de Dívidas Técnicas — DL Operational System

> Toda escolha temporária do MVP está aqui. Nada de dívida silenciosa.
> Campos: Descrição · Motivo · Impacto · Prioridade · Plano de resolução · Fase.

---

### TD01 — Dados mockados em `lib/mock-data.ts`
- **Descrição:** parte do domínio ainda vem de constantes mockadas.
- **Motivo:** MVP foca em navegação/UX antes do banco.
- **Impacto:** clientes, boards, calendario, briefing mensal, campanhas,
  Drive/Documentos/Planilhas, Inbox e tarefas do Meu Painel ja persistem no
  Supabase; superficies auxiliares de tarefas/calendario/briefing ainda
  dependem de mock/fallback. O Dashboard e o Meu Painel consomem dados reais
  das superficies migradas.
- **Prioridade:** Alta.
- **Plano:** continuar a camada de repositórios sobre Supabase, mantendo fallback
  mock apenas durante a transicao de cada superficie. Leituras reais ja aplicam
  filtro explicito de workspace em complemento ao RLS.
- **Fase:** 2–3.

### TD02 — Autenticação simbólica (`/login`) — concluído
- **Descrição:** qualquer submit leva ao dashboard; sem sessão real.
- **Motivo:** Supabase Auth fora do escopo do MVP.
- **Impacto:** sem proteção de rotas nem identidade real.
- **Prioridade:** Alta.
- **Plano:** Supabase Auth client-side + guard de sessão (`AuthGate`) foram
  implementados na Fase 2. `middleware.ts` (raiz) + `lib/supabase/middleware.ts`
  agora leem a sessao via cookie no servidor (`@supabase/ssr`,
  `createServerClient`/`updateSession`) antes de qualquer pagina renderizar:
  sem sessao, redireciona para `/login?next=<path>` direto na resposta HTTP,
  sem o flash client-side que existia antes. `lib/supabase.ts` (client de
  browser) trocou de `createClient` (supabase-js puro) para
  `createBrowserClient` (`@supabase/ssr`) para que a sessao fique em cookies e
  o middleware consiga le-la. Rotas publicas (`/login`, `/b/[token]` — link de
  briefing por token) ficam fora do guard. Modo mock (sem
  `NEXT_PUBLIC_SUPABASE_*`) faz o middleware no-op, mantendo o prototipo
  navegavel como antes. `AuthGate` (client) continua como segunda camada,
  reagindo a logout/expiracao de sessao em tempo real enquanto a pagina ja
  esta aberta — o RLS no Postgres permanece a protecao real de dados; isso
  e so UX/perf.
- **Fase:** 2 → concluido nesta rodada.

### TD03 — Dogtooth não chama a OpenAI (`lib/openai.ts`)
- **Descrição:** `askDogtooth` é um stub determinístico; ações não executam.
- **Motivo:** evitar chave/custos no MVP; manter contrato pronto.
- **Impacto:** chat não é inteligente; Construtor é catálogo visual.
- **Prioridade:** Média.
- **Plano:** rota server-side com `OPENAI_API_KEY` + execução das ações.
- **Fase:** 4.

### TD04 - Drive/Docs/Sheets sem integracao Google
- **Descricao:** listagens internas leem metadados do Supabase, mas editores
  ainda sao placeholders e dependem de fallback mock quando Supabase nao existe.
- **Motivo:** integracao Google (OAuth/embed) e grande e fora do MVP.
- **Impacto:** sem sincronizacao direta com Google nem edicao real embutida.
- **Prioridade:** Media.
- **Plano:** OAuth Google + APIs Drive/Docs/Sheets + embed.
- **Fase:** 5.

### TD05 - Inbox WhatsApp sem provedor real
- **Descricao:** conversas e mensagens leem Supabase, mas conexao por QR,
  webhooks e envio ainda sao simulados.
- **Motivo:** depende de provedor externo homologado.
- **Impacto:** nao envia nem recebe mensagens reais do WhatsApp.
- **Prioridade:** Media.
- **Plano:** Evolution API / Z-API / Baileys com abstracao de provider + webhooks.
- **Fase:** 5.

### TD06 - Meta Ads sem integracao real
- **Descricao:** metricas e tabela leem campanhas persistidas no Supabase; rota
  `app/api/meta/insights` ja existe e chama a Graph API real, mas falta plugar
  na UI (fluxo de vincular conta de anuncio + botao em Campanhas) e persistir
  o retorno via repositorio. `app/api/meta/insights` recebe `adAccountRecordId`
  (id interno de `ad_accounts`), nao o id da conta no Meta — o vinculo so e
  criado por `app/api/meta/ad-accounts/link`, que valida a conta na Graph API
  e grava via service role, igual ao padrao de `sheets`/TD09.
- **Motivo:** depende do `META_ACCESS_TOKEN`/conta de anuncio do cliente, que
  ainda nao foi recebido.
- **Impacto:** sem dados externos reais de performance ate ter o token; quando
  tiver, falta so ligar o botao e salvar o resultado.
- **Prioridade:** Media.
- **Plano:** configurar `META_ACCESS_TOKEN` (prod), chamar `POST
  /api/meta/ad-accounts/link` para vincular a conta do cliente, depois `POST
  /api/meta/insights` a partir de Campanhas e persistir via
  `lib/repositories/campaigns.ts`.
- **Fase:** 5.

### TD07 — Estado local volátil (modais, DnD, checklists)
- **Descrição:** algumas marcações de card ainda vivem só em estado React/mock.
- **Motivo:** sem persistência no MVP.
- **Impacto:** já persistem em Supabase: CRUD de clientes, tarefas do workspace,
  eventos de calendário (criar/editar/excluir), campanhas (status/saldo + excluir),
  quadros (criar/excluir) e cards (criar/editar título-descrição/excluir), ordem
  dos cards (DnD) e checklist mensal de briefing. Ainda não são duráveis: checklist,
  labels e responsável (assignee) de cards.
- **Prioridade:** Média.
- **Plano:** persistir os campos restantes do card (checklist/labels/assignee) via
  repositório quando entrarem em escopo.
- **Fase:** 3.

### TD08 — Trello não sincroniza
- **Descrição:** Trello -> DL ja importa board/listas/cards; DL -> Trello ja
  envia criacao/movimentacao de cards em listas importadas. Ainda nao ha criacao
  de boards/listas no Trello, webhooks, labels, membros e checklists completos.
- **Motivo:** fora do escopo do MVP.
- **Impacto:** o app consegue importar o board configurado e enviar alteracoes
  basicas de cards; detalhes avancados ainda ficam fora da sincronizacao.
- **Prioridade:** Baixa.
- **Plano:** completar API Trello com criacao de boards/listas, webhooks e
  mapeamento de labels/membros/checklists.
- **Fase:** 5.

### TD09 — Integrações reais portadas, falta ligar à UI (concluído nesta parte)
- **Descrição:** `lib/integrations/meta-ads.ts` e `google-sheets.ts` (portados de
  `danz`/legado) chamam as APIs reais (Graph API e Sheets v4) e são expostos via
  `app/api/meta/ad-accounts/link`, `app/api/meta/insights`,
  `app/api/sheets/create` e `app/api/sheets/export`, com validação de sessão e
  workspace igual ao padrão do Trello. Sem os tokens configurados, as rotas
  respondem `400` explicando o que falta — não quebram build/lint/typecheck.
  `sheets/create` é a única rota que grava `sheets.external_id` (via service
  role, depois de criar a planilha de fato no Google) — `sheets/export` só
  aceita um `sheetId` interno e resolve o `external_id` correspondente no
  servidor, nunca um `spreadsheetId` vindo do client. Mesmo padrão para
  `ad_accounts.external_id`/`meta/ad-accounts/link`: `meta/insights` recebe
  `adAccountRecordId` (id interno), nunca o id da conta no Meta.
- **Motivo:** as credenciais reais (Meta Ads, Google service account) dependem
  do cliente, que ainda não foi obtido; o código fica pronto para plugar.
- **Impacto:** nenhuma tela chama essas rotas ainda — falta o passo de UI
  (botão em Campanhas/Planilhas) e persistência do resultado via repositório.
- **Prioridade:** Baixa (infra pronta; só falta credencial + UI).
- **Plano:** quando tiver o token/service account do cliente, configurar as
  envs e ligar o botão na UI. Ver `lib/integrations/README.md`.
- **Fase:** 5.

### TD10 — Funcionalidades de topbar (busca global, notificações, tema)
- **Descrição:** acionam toast "integração futura".
- **Motivo:** fora do escopo do MVP.
- **Impacto:** funcionalidades auxiliares ausentes.
- **Prioridade:** Baixa.
- **Plano:** busca (Supabase/embeddings), notificações (`notifications`), tema.
- **Fase:** 6.

### TD11 — Permissões por papel (RBAC) — concluído nos domínios principais
- **Descrição:** RLS por papel aplicada em clientes, boards/colunas/cards,
  tarefas, campanhas, calendário e briefing/briefing_items: `select` para
  qualquer membro do workspace (`is_workspace_member`), `insert`/`update` para
  owner/admin/gestor (`is_workspace_editor`) e `delete` restrito a owner/admin
  (`is_workspace_admin`). Operador é somente-leitura nessas superfícies,
  inclusive em ações de "marcar como concluído" (tarefas, Meu Painel,
  checklist de briefing), pois são updates. A UI usa `useRole()`
  (`lib/role/RoleContext.tsx`) para esconder/desabilitar criar, editar, excluir
  e drag-and-drop de acordo com o papel, e o RLS garante o mesmo limite mesmo
  em chamadas diretas ao Supabase. Workspace e membros já tinham guard
  (`workspaces_admin_update`, `members_admin_update`/`members_admin_delete`).
- **Motivo:** RBAC completo fora do MVP original; agora cobre os domínios
  operacionais principais.
- **Impacto:** nenhum — knowingly trade-off: operador não marca a própria
  tarefa como concluída (mesma regra de só-leitura aplicada uniformemente).
  Reavaliar se isso for um problema real de uso.
- **Prioridade:** Baixa (resolvida; só falta granularidade fina, ex.: permitir
  operador concluir a própria tarefa).
- **Plano:** Drive/Documentos/Inbox/Chat continuam com policy única
  `_member_all` (todos os membros podem tudo) — fora do escopo desta rodada;
  avaliar se precisam do mesmo padrão quando ganharem escrita real. `sheets` e
  `ad_accounts` foram além do padrão admin-only: nenhuma das duas tem
  `insert`/`update` via RLS de cliente (só `select` para membro e `delete`
  para admin), porque `app/api/sheets/export` e `app/api/meta/insights`
  (TD09/TD06) confiam em `external_id` como prova de ownership, e até um admin
  pode pertencer a múltiplos workspaces — permitir que ele escrevesse essa
  coluna direto pela tabela reabriria a mesma falha (plantar o `external_id`
  de um recurso de outro workspace). A única escrita válida é via
  `app/api/sheets/create` / `app/api/meta/ad-accounts/link`, que usam a
  service role depois de criar a planilha no Google ou validar a conta na
  Graph API.
- **Fase:** 6.

### TD12 — Acesso granular a boards (operador) e documentos (admin)
- **Descrição:** dois operadores podem servir gestores diferentes na mesma
  empresa (ex.: um designer que atende dois gestores) — então o acesso nao e
  modelado por "carteira de cliente" e sim por atribuicao direta de board e
  liberacao direta de documento. `board_assignees(board_id, profile_id)`: um
  editor (owner/admin/gestor) atribui um board inteiro a um ou mais
  operadores; a funcao `can_view_board(board_id)` (`database/rls-policies.sql`)
  retorna true para qualquer editor do workspace ou para o operador
  explicitamente atribuido. As policies de select de `boards`,
  `board_columns` e `board_cards` passaram a usar essa funcao — operador sem
  atribuicao nao ve nenhum board. `document_admin_releases(document_id,
  profile_id)`: gestor/owner libera um documento especifico para um admin; a
  funcao `can_view_document(document_id, workspace_id)` retorna true para
  owner/gestor/operador (sem mudanca de comportamento para esses papeis) e
  para admin apenas se o documento foi liberado para ele. UI: botao "Gerenciar
  acesso" (ícone de pessoas) no card do board, visivel a quem `canEdit`, abre
  lista de operadores com checkbox; botao "Liberar para admins" na area de
  visualizacao de Documentos, visivel a quem `canEdit`, abre lista de admins
  com checkbox.
- **Motivo:** caso real reportado (Dental Leal): dois gestores (Bruno e
  Danyel), e um operador (Chico, designer) que atende ambos — modelo de
  carteira por cliente nao cobre esse compartilhamento; atribuicao direta por
  board resolve sem precisar modelar relacao N:N entre operador e gestor.
- **Impacto:** `tasks`/`campaigns`/`calendar_events`/`clients` nao tem
  atribuicao por operador — continuam visiveis a todo membro do workspace
  (igual TD11). Se um operador precisar de acesso granular nessas
  superficies tambem, replicar o mesmo padrao de tabela de atribuicao +
  funcao `security definer`.
- **Prioridade:** Baixa (resolvida para o caso reportado).
- **Plano:** nenhum pendente; revisitar se outras superficies (tarefas,
  campanhas) precisarem do mesmo controle granular por operador.
- **Fase:** 6.
