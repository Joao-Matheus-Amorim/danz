# ADR 0001 — Unificação: um produto (DL) como front + back

- **Status:** Aceito
- **Data:** 2026-06-16
- **Decisores:** Owner (Danyel), Tech Lead

## Contexto
O repositório `danz` contém hoje:
- um **motor operacional** Node/CommonJS (Meta Ads, Google Sheets, alertas,
  jobs/scheduler, histórico, segurança HTTP) com API em `api/[...path].js`;
- um **painel HTML estático** (`public/index.html` + `dashboard.js`/`analysis.js`)
  que era a interface provisória.

Foi criado um **front novo** em `dl-operational-system/` (Next.js + TS + Tailwind).
Resultado momentâneo: duas interfaces (HTML antigo + DL novo) e um back-end
separado — ambiguidade de produto e deploy desalinhado no Vercel (raiz buildando
o app antigo; previews/erros não tratados).

## Decisão
**O produto passa a ser um só: o app DL (Next.js), atuando como front e back.**
- Next.js concentra UI (`app/`) e API (`app/api/`).
- A **lógica** do `danz` (Meta Ads, Sheets, validações) é preservada e reaproveitada
  como módulos compartilhados chamados pelas rotas de API do DL.
- Jobs/scheduler migram para **Vercel Cron**.
- O **painel HTML antigo é aposentado**.
- Estado final: **1 repositório, 1 deploy, 1 domínio**.

## Consequências
**Positivas**
- Uma única cara de produto; sem duplicidade de front.
- Deploy previsível; um domínio canônico.
- Reuso da inteligência já validada do `danz` (sem reescrever).

**Custos / riscos**
- Migração das rotas e dos jobs exige trabalho faseado.
- Durante a transição conviveremos com **dois deploys** (DL + danz) de forma
  controlada (padrão *strangler*), até a absorção terminar.

## Plano de execução (faseado, cada fase = PR fechado e testado)
- **F1 — Publicar o DL como site único** (projeto Vercel com Root =
  `dl-operational-system`). Produção ganha uma cara única; `danz` segue servindo
  APIs/jobs sem quebrar.
- **F2 — Ligar o DL às APIs reais do `danz`** (começando por campanhas/Meta),
  trocando mock por dado real módulo a módulo.
- **F3 — Absorver o back no DL** (`app/api/` + Vercel Cron) e **desligar o HTML
  antigo**.
- **F4 — Limpeza:** remover órfãos, atualizar docs e fechar itens do
  `technical-debt-log.md`.

## Alternativas consideradas
1. **Manter dois fronts** (HTML do danz + DL) — rejeitado: ambiguidade de produto.
2. **DL front + danz motor separado permanente** — viável, mas mantém 2 deploys
   para sempre; fica como *fallback* se a absorção (F3) se mostrar custosa demais.

## Notas de transição
Enquanto F1–F2 estão ativas, é **esperado e aceitável** existir o projeto Vercel
do `danz` (APIs/jobs) e o projeto do DL (interface). Isso não é dívida oculta —
está registrado aqui e converge para um único deploy ao fim da F3.
