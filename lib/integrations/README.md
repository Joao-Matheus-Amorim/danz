# lib/integrations — clientes de APIs externas

| Arquivo | O que faz | Usado por |
|---|---|---|
| `meta-ads.ts` | Chamadas reais à Graph API do Meta (`fetch` nativo + `META_ACCESS_TOKEN`) | `app/api/meta/insights` |
| `google-sheets.ts` | Acesso real ao Google Sheets (`googleapis` + JWT de service account) | `app/api/sheets/export` |

## Estado
- Portados de `danz` (legado erradicado) para TypeScript server-side. As rotas
  acima validam sessão (Bearer) e workspace antes de chamar o cliente.
- Sem os tokens (`META_ACCESS_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `GOOGLE_PRIVATE_KEY`) as rotas respondem `400` explicando o que falta — não
  quebram o build nem o restante do app.
- Nenhuma tela ainda chama essas rotas (ver TD09/TD06 em
  `docs/technical-debt-log.md`); falta ligar um botão real em Campanhas/Planilhas
  quando isso entrar em escopo.

## Próximo passo (quando tiver credenciais do cliente)
1. Configurar as envs em `.env.local` (dev) e na Vercel/Supabase (prod).
2. Ligar a UI (ex.: botão "Atualizar do Meta" em Campanhas) chamando
   `POST /api/meta/insights` com `adAccountId`/`since`/`until`.
3. Persistir o resultado via repositório (`lib/repositories/campaigns.ts`) em vez
   de só exibir a resposta da API.
