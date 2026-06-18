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

### TD02 — Autenticação simbólica (`/login`)
- **Descrição:** qualquer submit leva ao dashboard; sem sessão real.
- **Motivo:** Supabase Auth fora do escopo do MVP.
- **Impacto:** sem proteção de rotas nem identidade real.
- **Prioridade:** Alta.
- **Plano:** Supabase Auth client-side + guard de sessão foram implementados na
  Fase 2. Middleware/SSR pode entrar depois com `@supabase/ssr`.
- **Fase:** 2.

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
- **Descricao:** metricas e tabela leem campanhas persistidas no Supabase; token
  Meta ainda nao e configurado de fato.
- **Motivo:** integracao Meta fora do MVP.
- **Impacto:** sem dados externos reais de performance.
- **Prioridade:** Media.
- **Plano:** portar `lib/integrations/meta-ads.legacy.js` (Graph API) para rota
  server-side TS (`app/api/meta/...`).
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

### TD09 — Integrações reais ainda não portadas (legado `danz` colhido)
- **Descrição:** `lib/integrations/*.legacy.js` (Meta Ads via Graph API e Google
  Sheets) foram colhidos do `danz` erradicado, mas ainda não foram portados nem
  ligados ao app.
- **Motivo:** são CommonJS e dependem de `axios`/`googleapis`; portar para TS é da
  Fase 5. Mantidos fora do build/lint/typecheck até lá.
- **Impacto:** sem dados externos reais (Meta/Sheets) por enquanto.
- **Prioridade:** Média.
- **Plano:** portar para rotas server-side TS em `app/api/`, com tokens só no
  servidor; remover os `.legacy.js` após portar. Ver `lib/integrations/README.md`
  e `adr-0001`.
- **Fase:** 5.

### TD10 — Funcionalidades de topbar (busca global, notificações, tema)
- **Descrição:** acionam toast "integração futura".
- **Motivo:** fora do escopo do MVP.
- **Impacto:** funcionalidades auxiliares ausentes.
- **Prioridade:** Baixa.
- **Plano:** busca (Supabase/embeddings), notificações (`notifications`), tema.
- **Fase:** 6.

### TD11 — Permissões por papel não aplicadas
- **Descrição:** papéis existem nos tipos/seed e há políticas por papel
  (`workspaces_admin_update`; `members_admin_update`/`members_admin_delete`,
  restritas a owner/admin via `is_workspace_admin`), incluindo convite real de
  usuário (`/api/workspace/members/invite`, com `SUPABASE_SERVICE_ROLE_KEY`) e
  troca de função/remoção de membros em Configurações. A UI ainda não restringe
  as demais ações (boards, clientes, campanhas etc.) por papel.
- **Motivo:** RBAC completo fora do MVP.
- **Impacto:** fora da edição do workspace e gestão de membros, todos veem/fazem
  tudo nas demais superfícies.
- **Prioridade:** Média.
- **Plano:** refinar RLS por papel + guards na UI nas demais superfícies.
- **Fase:** 6.
