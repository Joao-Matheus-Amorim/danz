# Escopo — DL Operational System

## Dentro do MVP (Fase 1)
- Shell de aplicação: sidebar com rota ativa, topbar, layout responsivo.
- Páginas navegáveis e funcionais com dados mockados:
  - Dashboard, DLtinho, Meu Painel, Boards, Clientes, Calendário, Drive,
    Documentos, Planilhas, Inbox, Briefings, Campanhas, Configurações, Login.
- Interações locais (estado React) onde fazem sentido:
  - Boards: drag and drop de cards (dnd-kit).
  - Clientes: busca, filtro de status e modal de novo cliente (estado local).
  - Calendário: navegação de mês, filtros de visão e modal de novo evento.
  - Meu Painel / Briefings: marcar tarefas/itens.
  - DLtinho: chat com resposta simulada (stub, sem OpenAI).
- Identidade visual premium (tema escuro, neon verde-limão, glassmorphism).
- Tipos centralizados, mock-data centralizado, rotas e constantes centralizadas.
- Estrutura de banco (`database/`) e camadas de integração preparadas (sem chamadas reais).

## Fora do MVP (fases futuras)
- Autenticação real (Supabase Auth) — Fase 2.
- CRUD persistente em banco — Fase 3.
- Execução real de ações da IA / chamadas OpenAI — Fase 4.
- Integrações reais: Google Drive/Docs/Sheets, WhatsApp, Meta Ads, Trello — Fase 5.
- Permissões por papel e operação multiusuário — Fase 6.
- Busca global, notificações reais, alternância de tema.

## Entregáveis por fase
- **Fase 1:** frontend navegável + docs + schema/RLS previstos. *(este MVP)*
- **Fase 2:** projeto Supabase, auth, aplicação do schema/RLS, env configurado.
- **Fase 3:** repositórios de dados substituindo mock-data; CRUD completo.
- **Fase 4:** rota server-side de IA + execução de ações do DLtinho.
- **Fase 5:** conectores de Google/WhatsApp/Meta/Trello (e ponte com o `danz`).
- **Fase 6:** RBAC, convites, auditoria ativa.

## Critérios de aceite (MVP)
- [x] Todas as páginas existem e navegam.
- [x] Sidebar marca item ativo.
- [x] Visual consistente com a identidade definida.
- [x] Sem erros de TypeScript / imports quebrados / componentes órfãos.
- [x] Mock-data centralizado.
- [x] Nenhuma integração falsa apresentada como real (uso de toasts "integração futura").
- [x] Estrutura pronta para Supabase e IA.
- [x] Docs PMBOK + technical-debt-log preenchidos.
