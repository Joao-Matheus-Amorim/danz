# Requisitos - DL Operational System

## Requisitos Funcionais
| ID | Requisito | Status atual |
|----|-----------|--------------|
| RF01 | Navegar entre secoes via sidebar com rota ativa | Concluido |
| RF02 | Dashboard com hero, KPIs, crescimento e widgets | Concluido |
| RF03 | Dogtooth: chat, conversas, sugestoes e construtor | Stub |
| RF04 | Meu Painel: agenda, metricas, tarefas e pontuacao | Agenda/tarefas em Supabase; demais widgets em mock/fallback |
| RF05 | Boards: grid, quadro, card, drag and drop e persistencia | Supabase; CRUD de quadro (criar/excluir; quadro do Trello nao e excluivel) e de card (criar/editar/excluir) |
| RF06 | Clientes: tabela, busca, filtro e CRUD | Supabase; criar, editar (nome, bandeira, plano, status) e excluir |
| RF07 | Calendario: grade mensal, filtros e CRUD de eventos | Supabase; criar/editar/excluir nas visoes Agenda e Mes, com confirmacao de exclusao |
| RF08 | Briefings: controle mensal, checklist e formularios publicos | Supabase; checklist mensal + link publico por cliente (/b/[token]) que o cliente preenche sem login, com status e resposta na UI da agencia |
| RF09 | Campanhas: metricas, tabela Meta Ads e aviso de token | Metricas/tabela em Supabase; editar status/saldo e excluir campanha; token Meta em mock/fallback |
| RF10 | Drive/Documentos/Planilhas: navegacao e shells | Metadados em Supabase; editores Google em mock/fallback |
| RF11 | Inbox: conexao WhatsApp, conversas e painel | Conversas/mensagens em Supabase; conexao/envio em mock/fallback |
| RF12 | Configuracoes: workspace, usuarios e integracoes | Nome/segmento do workspace persistem (owner/admin via RLS); usuarios reais via Supabase (convidar, trocar funcao, remover, owner/admin via RLS); integracoes em mock/fallback |
| RF13 | Login | Supabase Auth quando envs existem; fallback local sem envs |
| RF14 | Trello: importar board/listas/cards | Preparado server-side |
| RF15 | Trello: enviar criacao/movimento de card | Preparado server-side |

## Requisitos Nao Funcionais
- **RNF01 - Stack:** Next.js App Router, TypeScript estrito, Tailwind e shadcn/ui.
- **RNF02 - Organizacao:** componentes pequenos, tipados e reutilizaveis; dados
  por repositorios ou `mock-data.ts`, nunca arrays soltos em paginas.
- **RNF03 - Sem divida silenciosa:** mock, fallback e decisao temporaria precisam
  constar em `technical-debt-log.md`.
- **RNF04 - Resiliencia:** app deve funcionar sem envs em modo mock.
- **RNF05 - Manutenibilidade:** padroes visuais reaproveitaveis (`PageHeader`,
  `Card`, `Button`, classes `.dl-*`).

## Requisitos de Seguranca
- **RSeg01:** chaves sensiveis nunca ficam no client.
- **RSeg02:** Supabase usa RLS por `workspace_id`.
- **RSeg03:** Supabase e Trello sao tolerantes a ausencia de envs no ambiente
  local.
- **RSeg04:** nenhuma credencial real versionada.
- **RSeg05:** Trello usa token server-side e sessao Supabase do usuario para
  aplicar RLS nas escritas.
- **RSeg06:** RLS por papel (owner/admin/gestor/operador) em clientes,
  boards/cards, tarefas, campanhas, calendario e briefing: leitura para
  qualquer membro, escrita para owner/admin/gestor, exclusao restrita a
  owner/admin. A UI reflete a mesma regra via `useRole()`, mas a garantia real
  e o RLS.

## Requisitos de UX
- **RUX01:** tema escuro premium consistente.
- **RUX02:** labels pequenos, cards de vidro e neon como destaque.
- **RUX03:** todo botao deve navegar, abrir modal, mudar estado, disparar acao
  real ou exibir feedback claro.
- **RUX04:** datas e textos em pt-BR.

## Requisitos de Performance
- **RPerf01:** Server Components por padrao.
- **RPerf02:** graficos leves.
- **RPerf03:** imports diretos por componente.
- **RPerf04:** DnD deve persistir apenas o conjunto necessario de cards movidos.
