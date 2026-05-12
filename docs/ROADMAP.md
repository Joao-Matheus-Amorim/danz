# Roadmap de Implementação — Tráfego Automator / Danz

Este documento mostra o estado real do produto, o que já está pronto, o que falta para operar com dados reais e qual é a próxima direção técnica.

---

## Visão atual

O projeto deixou de ser apenas um script de preenchimento e virou uma base de produto operacional para gestor de tráfego.

Hoje ele cobre:

```text
Registry multi-cliente
  -> Segment adapters
    -> Dental Fill controlado
      -> Delivery operacional
        -> Persistência SQLite
          -> Histórico por API
            -> Painel web
              -> Análise Campanha -> Conjunto -> Criativo
```

---

## Regra atual de prioridade

A prioridade não é adicionar novas telas soltas. A prioridade é preparar o caminho seguro para operação real:

1. manter `check` e testes passando;
2. manter registry e YAML estáveis;
3. manter dry-run confiável;
4. manter histórico/auditoria antes de qualquer escrita real;
5. configurar credenciais reais em staging;
6. rodar primeiro teste real com escopo mínimo.

---

## Estado atual consolidado

| Marco | Nome | Status | Resultado |
|---|---|---:|---|
| Q1 | Fundação de qualidade, segurança e testes | OK parcial | Check, Jest, CI, segurança HTTP, retry Meta e validações básicas |
| Q2 | Persistência local | OK inicial | SQLite, notificações, job runs, steps e resultados por unidade |
| OP1 | Data, período e aba | OK | Resolver data operacional e sheet por estado/mês/data |
| OP2 | Campos e delivery | OK | `--fields` e `--delivery none/log/notify/approval` |
| M1 | Registry de empresas/unidades | OK funcional | SP/BA carregam, filtros funcionam, validate agrupa pendências |
| M2 | Dental Fill literal | OK dry-run | Preenche conceitualmente Leads/Valor, preserva CPL por padrão |
| G4 | Segment adapters | OK | `odontologia` e `generic`, job Dental delega regras por segmento |
| G5 | Delivery operacional | OK | Log, notificação interna e aprovação pendente |
| G6 | Histórico operacional | OK | APIs protegidas `/api/history/*` com serviço compartilhado |
| G6.1 | Teste HTTP real local | OK | Endpoints testados via `curl` com token local |
| G7.1 | Painel histórico real | OK | Aba Histórico lê notificações, aprovações, jobs e unidades |
| G8 | Estrutura de análise | OK | Aba Campanhas virou árvore Campanha -> Conjunto -> Criativo |
| G8.1 | Normalização por IDs | OK | Relações por `campaignId/adsetId`, nomes só como fallback/exibição |

---

## Onde o projeto está agora

### Backend/local

- `src/web/server.js` serve o painel e APIs locais.
- `api/[...path].js` replica as rotas para serverless/Vercel.
- `src/services/historyService.js` centraliza histórico.
- `src/services/deliveryManager.js` centraliza delivery operacional.
- `src/database/repositories.js` persiste notificações, jobs e resultados.
- `src/jobs/dentalSheetFill.js` executa o fluxo Dental em dry-run/controlado.

### Frontend/painel

- Dashboard executivo.
- Campanhas com árvore `Campanha -> Conjunto -> Criativo`.
- Criativos ainda como tabela plana, aguardando virar Laboratório Criativo.
- Automação mock.
- WhatsApp mock.
- Histórico real lendo endpoints protegidos com token.

### Modelo de análise Meta

O painel já está preparado para trabalhar assim:

```text
campaign.id
  -> adset.campaignId
    -> creative.adsetId
```

Visualmente ele mostra:

```text
campaignName
adsetName
creative.name/adName
```

---

## O que falta para operar real

### Credenciais e ambiente

- `OPERATIONAL_API_TOKEN` real.
- `META_ACCESS_TOKEN` real.
- `act_...` real da conta Meta central no registry Dental.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
- `GOOGLE_PRIVATE_KEY`.
- Planilha compartilhada com a service account.
- Decisão de banco cloud para produção real, se sair do uso local.

### Validações reais

- Validar token Meta sem escrita.
- Buscar insights reais da conta central.
- Confirmar campos reais retornando:
  - `campaign_id`;
  - `campaign_name`;
  - `adset_id`;
  - `adset_name`;
  - `ad_id`;
  - `ad_name`.
- Confirmar `matchedRows > 0` para campanhas das clínicas.
- Rodar Google Sheets em dry-run com ranges corretos.
- Fazer primeira escrita real em um único dia, um estado e, se possível, poucas unidades.

---

## Ordem segura para produção real

1. Atualizar `.env` local com credenciais reais.
2. Trocar `act_PREENCHER_CONTA_CENTRAL` por `act_...` real.
3. Rodar:

```bash
npm run check
npm test
npm run registry:validate
```

4. Rodar dry-run Meta/Sheets:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery approval
```

5. Conferir no painel:

```text
Histórico -> Aprovações pendentes
Histórico -> Resultados por unidade
Campanhas -> Campanha -> Conjunto -> Criativo
```

6. Rodar execução real mínima somente depois do dry-run validado.
7. Conferir planilha manualmente.
8. Ampliar gradualmente.

---

## Próximos cortes recomendados

### Grupo 8.2 — Laboratório Criativo

Transformar a aba Criativos em painel de decisão:

```text
Vencedores
Atenção
Queimando verba
Testes sugeridos
```

### Grupo 9 — Meta real em staging

Conectar Meta Ads real sem escrever planilha:

```text
validar token
validar act real
buscar insights por campaign/adset/ad
normalizar retorno real para o mesmo modelo do mock
```

### Grupo 10 — Google Sheets real controlado

Primeira escrita real com escopo mínimo:

```text
1 dia
1 estado
poucas unidades
approval/histórico ativo
```

### Grupo 11 — WhatsApp real

Somente após histórico, aprovação e execução real mínima estarem confiáveis.

---

## Comandos de saúde do projeto

```bash
npm run check
npm test
npm run registry:validate
npm run dental:fill:dry -- --state SP --day 2026-05-10 --delivery approval
```

---

## Regra de governança

Toda nova fase precisa atualizar:

1. README;
2. ROADMAP;
3. documento técnico correspondente;
4. testes;
5. validação local;
6. próximo passo explícito.
