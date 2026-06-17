# ADR 0001 — Um produto só (DL): danz erradicado, DL na raiz

- **Status:** Aceito
- **Data:** 2026-06-16
- **Decisores:** Owner (Danyel), Tech Lead

## Contexto
O repositório tinha dois protótipos convivendo:
- **`danz`** (Node/CommonJS): API web + painel HTML que serviam **dados mock**
  (`src/web/mockData.js`). Nunca esteve em operação real.
- **`dl-operational-system`** (Next.js): o front SaaS novo, também mock, porém é
  **o que tem valor real** e já foi publicado.

Verificação do código do `danz` mostrou que **a única parte real** (não-mock) eram
as integrações que chamam APIs externas de verdade:
- `src/services/metaAds.js` — Graph API do Meta (axios + `META_ACCESS_TOKEN`);
- `src/services/googleSheets.js` — Google Sheets (`googleapis` + JWT).

## Decisão
**Erradicar o `danz` e adotar o DL como produto único, na raiz do repositório.**
- O app DL passa a ser a **raiz** do repo (1 repo, 1 deploy, 1 domínio).
- Todo o legado `danz` é removido (web mock, jobs, painel HTML, configs).
- A lógica de integração real é **colhida** para `lib/integrations/*.legacy.js`
  e será portada para rotas server-side TypeScript do DL na Fase 2.
- O destino segue sendo **DL como front + back** (Next.js `app/api/` + Vercel Cron).

## Consequências
**Positivas**
- Fim da ambiguidade de produto e da duplicidade de deploy.
- Repo limpo: só o que tem valor real.
- Nenhum código real é perdido (integrações preservadas e documentadas).

**Custos / riscos**
- O Vercel precisa apontar **Root Directory = `.`** (raiz), já que o app saiu da
  subpasta. (Ação de painel registrada abaixo.)
- As integrações colhidas estão em CommonJS e fora do build até serem portadas
  (Fase 2) — registrado em `lib/integrations/README.md`.

## Ação operacional (Vercel)
Após este merge, no projeto Vercel: **Settings → Build and Deployment → Root
Directory = `.`** (era `dl-operational-system`) e Redeploy. O `vercel.json` na raiz
fixa `framework: nextjs`.

## Alternativas consideradas
1. Manter o `danz` como motor separado — rejeitado: era protótipo mock, sem
   operação real; manter traria dois deploys sem ganho.
2. Apagar tudo, inclusive integrações — rejeitado: jogaria fora o único código
   real e reutilizável.
