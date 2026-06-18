# lib/integrations — clientes de APIs externas

| Arquivo | O que faz | Usado por |
|---|---|---|
| `meta-ads.ts` | Chamadas reais à Graph API do Meta (`fetch` nativo + `META_ACCESS_TOKEN`) | `app/api/meta/ad-accounts/link`, `app/api/meta/insights` |
| `google-sheets.ts` | Acesso real ao Google Sheets (`googleapis` + JWT de service account) | `app/api/sheets/create`, `app/api/sheets/export` |

## Estado
- Portados de `danz` (legado erradicado) para TypeScript server-side. As rotas
  acima validam sessão (Bearer) e workspace antes de chamar o cliente.
- Sem os tokens (`META_ACCESS_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `GOOGLE_PRIVATE_KEY`) as rotas respondem `400` explicando o que falta — não
  quebram o build nem o restante do app.
- `sheets.external_id` (qual spreadsheet do Google corresponde a cada registro)
  é gravado **somente** por `app/api/sheets/create`, usando a service role do
  Supabase depois que o próprio servidor cria a planilha via Sheets API. A
  tabela `sheets` não tem `insert`/`update` via RLS de cliente — só `select`
  (qualquer membro) e `delete` (admin). Isso evita que um usuário "plante" um
  `external_id` de planilha de outro workspace para passar pela checagem de
  ownership em `sheets/export`.
- Mesmo padrão para `ad_accounts.external_id` (id da conta de anúncio no
  Meta): só `app/api/meta/ad-accounts/link` grava essa coluna, via service
  role, depois de validar a conta na Graph API com o token do servidor.
  `app/api/meta/insights` recebe `adAccountRecordId` (id interno do vínculo),
  não o id do Meta — sem isso, qualquer membro poderia consultar saldo e
  insights de uma conta de anúncio pertencente a outro workspace.
- Nenhuma tela ainda chama essas rotas (ver TD09/TD06 em
  `docs/technical-debt-log.md`); falta ligar um botão real em Campanhas/Planilhas
  quando isso entrar em escopo.

## Próximo passo (quando tiver credenciais do cliente)
1. Configurar as envs em `.env.local` (dev) e na Vercel/Supabase (prod).
2. Ligar a UI: um fluxo de "vincular conta de anúncio" chamando
   `POST /api/meta/ad-accounts/link` com `adAccountId`, depois um botão
   "Atualizar do Meta" em Campanhas chamando `POST /api/meta/insights` com
   `adAccountRecordId`/`since`/`until`.
3. Persistir o resultado via repositório (`lib/repositories/campaigns.ts`) em vez
   de só exibir a resposta da API.
