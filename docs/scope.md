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
- **Fase 3:** clientes, boards, calendario, briefing mensal e tarefas do Meu
  Painel ja persistem no Supabase.
- **Fase 5:** Trello iniciado com importacao de board/listas/cards e envio
  controlado de cards.

## Ainda Fora do Corte Atual
- CRUD real de campanhas, arquivos, inbox, configuracoes, formularios publicos
  de briefing, edicao/exclusao de eventos e tarefas fora do Meu Painel.
- Execucao real de acoes da IA e chamadas OpenAI.
- Integracoes Google Drive/Docs/Sheets, WhatsApp e Meta Ads.
- Criacao de boards/listas no Trello, webhooks, labels, membros e checklists.
- Permissoes completas por papel, convites e operacao multiusuario avancada.
- Busca global, notificacoes reais e alternancia de tema.

## Entregaveis por Fase
- **Fase 1:** frontend navegavel + docs + schema/RLS previstos.
- **Fase 2:** Supabase Auth, schema/RLS, seed e envs.
- **Fase 3:** repositorios de dados por dominio; clientes, boards, calendario,
  briefing mensal e tarefas do Meu Painel entregues, demais dominios por cortar.
- **Fase 4:** rota server-side de IA + execucao de acoes do Dogtooth.
- **Fase 5:** conectores reais; Trello iniciado, demais provedores pendentes.
- **Fase 6:** RBAC, convites e auditoria ativa.

## Criterios de Aceite Atuais
- [x] Todas as paginas existem e navegam.
- [x] Sidebar marca item ativo.
- [x] Visual consistente com a identidade definida.
- [x] Sem erros de TypeScript, imports quebrados ou componentes orfaos.
- [x] Mock-data centralizado para superficies ainda nao migradas.
- [x] Supabase Auth e seed preparados.
- [x] Clientes e boards persistem em Supabase.
- [x] Tarefas do Meu Painel persistem em Supabase.
- [x] Calendario e agenda do Meu Painel persistem em Supabase.
- [x] Briefing mensal persiste em Supabase.
- [x] Trello preparado sem expor credenciais no client.
- [x] Docs PMBOK e dividas tecnicas atualizados.
