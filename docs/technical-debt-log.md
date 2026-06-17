# Registro de Dívidas Técnicas — DL Operational System

> Toda escolha temporária do MVP está aqui. Nada de dívida silenciosa.
> Campos: Descrição · Motivo · Impacto · Prioridade · Plano de resolução · Fase.

---

### TD01 — Dados mockados em `lib/mock-data.ts`
- **Descrição:** todo o domínio (clientes, boards, tarefas, campanhas, etc.) vem
  de constantes mockadas.
- **Motivo:** MVP foca em navegação/UX antes do banco.
- **Impacto:** dados não persistem; sem multiusuário real.
- **Prioridade:** Alta.
- **Plano:** camada de repositórios sobre Supabase com as mesmas assinaturas.
- **Fase:** 2–3.

### TD02 — Autenticação simbólica (`/login`)
- **Descrição:** qualquer submit leva ao dashboard; sem sessão real.
- **Motivo:** Supabase Auth fora do escopo do MVP.
- **Impacto:** sem proteção de rotas nem identidade real.
- **Prioridade:** Alta.
- **Plano:** Supabase Auth client-side + guard de sessão foram implementados na
  Fase 2. Middleware/SSR pode entrar depois com `@supabase/ssr`.
- **Fase:** 2.

### TD03 — DLtinho não chama a OpenAI (`lib/openai.ts`)
- **Descrição:** `askDLtinho` é um stub determinístico; ações não executam.
- **Motivo:** evitar chave/custos no MVP; manter contrato pronto.
- **Impacto:** chat não é inteligente; Construtor é catálogo visual.
- **Prioridade:** Média.
- **Plano:** rota server-side com `OPENAI_API_KEY` + execução das ações.
- **Fase:** 4.

### TD04 — Drive/Docs/Sheets mockados
- **Descrição:** listagens vêm do mock; editores são placeholders.
- **Motivo:** integração Google (OAuth/embed) é grande e fora do MVP.
- **Impacto:** sem arquivos reais nem edição.
- **Prioridade:** Média.
- **Plano:** OAuth Google + APIs Drive/Docs/Sheets + embed.
- **Fase:** 5.

### TD05 — Inbox WhatsApp mockado
- **Descrição:** conexão por QR e mensagens são simuladas.
- **Motivo:** depende de provedor externo homologado.
- **Impacto:** não envia/recebe mensagens reais.
- **Prioridade:** Média.
- **Plano:** Evolution API / Z-API / Baileys com abstração de provider + webhooks.
- **Fase:** 5.

### TD06 — Campanhas (Meta Ads) mockadas
- **Descrição:** métricas e tabela são mock; token não é configurado de fato.
- **Motivo:** integração Meta fora do MVP.
- **Impacto:** sem dados reais de performance.
- **Prioridade:** Média.
- **Plano:** portar `lib/integrations/meta-ads.legacy.js` (Graph API) para rota
  server-side TS (`app/api/meta/...`).
- **Fase:** 5.

### TD07 — Estado local volátil (modais, DnD, checklists)
- **Descrição:** novo cliente/evento/tarefa, ordem dos cards e marcações vivem só
  em estado React; somem ao recarregar.
- **Motivo:** sem persistência no MVP.
- **Impacto:** alterações não duráveis.
- **Prioridade:** Alta.
- **Plano:** persistir via repositórios (Fase 3).
- **Fase:** 3.

### TD08 — Trello não sincroniza
- **Descrição:** botão "Atualizar do Trello" apenas sinaliza integração futura.
- **Motivo:** fora do escopo do MVP.
- **Impacto:** boards não refletem o Trello real.
- **Prioridade:** Baixa.
- **Plano:** API Trello + mapeamento para `boards/columns/cards`.
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
- **Descrição:** papéis existem nos tipos/seed, mas a UI não restringe ações.
- **Motivo:** RBAC fora do MVP.
- **Impacto:** todos veem/fazem tudo.
- **Prioridade:** Média.
- **Plano:** refinar RLS por papel + guards na UI.
- **Fase:** 6.
