# Escopo - DL Operational System

## MVP Original
- Shell de aplicacao com sidebar, topbar e layout responsivo.
- Paginas navegaveis: Dashboard, Dogtooth, Meu Painel, Boards, Clientes,
  Calendario, Drive, Documentos, Planilhas, Inbox, Briefings, Campanhas,
  Configuracoes e Login.
- Interacoes locais onde faziam sentido: DnD de boards, filtros, modais,
  calendario, briefings e chat stub.
- Identidade visual premium.
- Tipos, rotas, constantes e mock-data centralizados.

## Estado Pos-MVP
- **Fase 2:** Supabase Auth, schema, RLS, seed e setup documentado.
- **Fase 3 (operacional concluida):** CRUD real por repositorio para clientes,
  calendario (Agenda + Mes), campanhas (status/saldo + exclusao), boards e cards
  (criar/editar/excluir + DnD) e tarefas do workspace. Briefing mensal e
  formularios publicos de briefing (link `/b/[token]` preenchido sem login)
  tambem persistem. Drive, Documentos, Planilhas e Inbox leem dados do Supabase.
  Configuracoes salva nome/segmento do workspace (owner/admin). Repositorios reais
  filtram por workspace junto com RLS; Dashboard e Meu Painel consomem esses dados.
  Testes Vitest cobrem os repositorios.
- **Fase 5:** Trello iniciado com importacao de board/listas/cards e envio
  controlado de cards.
- **Fase 6 (RBAC iniciado):** convite real de usuario, troca de funcao e
  remocao de membro em Configuracoes (owner/admin); RLS por papel em
  clientes, boards/cards, tarefas, campanhas, calendario e briefing
  (operador so le; gestor cria/edita; owner/admin tambem exclui), refletida
  na UI via `useRole()`.

## Ainda Fora do Corte Atual
- Escrita/sincronizacao real de arquivos (Drive/Docs/Sheets) e envio no Inbox.
- Execucao real de acoes da IA e chamadas OpenAI.
- Integracoes Google Drive/Docs/Sheets, WhatsApp e Meta Ads.
- Criacao de boards/listas no Trello, webhooks, labels, membros e checklists.
- RBAC em Drive/Documentos/Planilhas/Inbox/Chat (ainda `_member_all`); auditoria
  ativa e operacao multiusuario avancada.
- Busca global, notificacoes reais e alternancia de tema.

## Entregaveis por Fase
- **Fase 1:** frontend navegavel + docs + schema/RLS previstos.
- **Fase 2:** Supabase Auth, schema/RLS, seed e envs.
- **Fase 3:** CRUD real por dominio concluido — clientes, calendario, campanhas,
  boards/cards e tarefas (criar/editar/excluir) + briefing mensal e formularios
  publicos de briefing; leituras de Drive/Docs/Planilhas/Inbox persistidas;
  salvar workspace em Configuracoes; testes Vitest dos repositorios.
- **Fase 4:** rota server-side de IA + execucao de acoes do Dogtooth.
- **Fase 5:** conectores reais; Trello iniciado, demais provedores pendentes.
- **Fase 6:** RBAC (concluido nos dominios principais) e convites entregues;
  auditoria ativa pendente.

## Criterios de Aceite Atuais
- [x] Todas as paginas existem e navegam.
- [x] Sidebar marca item ativo.
- [x] Visual consistente com a identidade definida.
- [x] Sem erros de TypeScript, imports quebrados ou componentes orfaos.
- [x] Mock-data centralizado para superficies ainda nao migradas.
- [x] Supabase Auth e seed preparados.
- [x] Clientes e boards persistem em Supabase.
- [x] Tarefas do Meu Painel persistem em Supabase.
- [x] Perfil, cards e projetos do Meu Painel usam dados persistidos.
- [x] Calendario e agenda do Meu Painel persistem em Supabase.
- [x] Briefing mensal persiste em Supabase.
- [x] Formularios publicos de briefing: link por cliente (`/b/[token]`), gravacao
      via funcoes `anon` e leitura da resposta na UI da agencia.
- [x] CRUD de clientes, calendario, campanhas, boards e cards persiste em Supabase.
- [x] Exclusoes passam por confirmacao (`ConfirmDialog`).
- [x] Campanhas leem dados persistidos do Supabase.
- [x] Drive, Documentos e Planilhas leem metadados persistidos do Supabase.
- [x] Inbox le conversas e mensagens persistidas do Supabase.
- [x] Configuracoes salva nome/segmento do workspace (owner/admin via RLS).
- [x] Sidebar mostra o workspace autenticado.
- [x] Dashboard usa dados reais das superficies ja persistidas.
- [x] Testes Vitest cobrem os repositorios (incl. filtro de workspace).
- [x] Trello preparado sem expor credenciais no client.
- [x] Convidar, trocar funcao e remover membro do workspace (owner/admin).
- [x] RBAC por papel em clientes, boards/cards, tarefas, campanhas, calendario
      e briefing (RLS + UI via `useRole()`).
- [x] Docs PMBOK e dividas tecnicas atualizados.
