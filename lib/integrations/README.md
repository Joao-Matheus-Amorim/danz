# lib/integrations — código colhido do danz (legado)

Estes arquivos são a **única parte com valor real** do antigo projeto `danz`
(erradicado): a lógica de integração que realmente chama APIs externas.

| Arquivo | Origem | O que faz |
|---|---|---|
| `meta-ads.legacy.js` | `danz/src/services/metaAds.js` | Chamadas reais à Graph API do Meta (axios + `META_ACCESS_TOKEN`) |
| `google-sheets.legacy.js` | `danz/src/services/googleSheets.js` | Acesso real ao Google Sheets (`googleapis` + JWT) |

## Estado
- São **CommonJS** (`require`/`module.exports`) e dependem de pacotes ainda **não
  instalados** neste app (`axios`, `googleapis`).
- **Não são importados em lugar nenhum** e estão **excluídos do build/lint/typecheck**
  (ver `tsconfig.json` → `exclude` e `.eslintignore`). Servem só de referência.

## Plano (Fase 2 — ver docs/roadmap.md)
Portar para rotas server-side TypeScript em `app/api/` (ex.: `app/api/meta/...`,
`app/api/sheets/...`), adicionando `axios`/`googleapis` ao `package.json` e lendo os
tokens de variáveis de ambiente **somente no servidor**. Depois de portado e testado,
remover o `.legacy.js` correspondente.
