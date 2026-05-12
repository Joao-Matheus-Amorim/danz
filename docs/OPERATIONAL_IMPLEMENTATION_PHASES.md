# Fases Operacionais de Implementação — Tráfego Automator / Danz

Este documento organiza a evolução operacional do projeto, considerando o estado real atual do código.

---

## Diagnóstico atual

O projeto já possui uma base operacional consistente:

- Q1 implementado parcialmente e validado localmente: segurança, testes, CI, validação e retry.
- Q2 implementado inicialmente: SQLite local, notificações, execuções e resultados por unidade.
- M1 funcional: registry de empresa, estados e clínicas.
- M2 funcional em dry-run: preenchimento Dental com conta Meta central e `campaignMatch`.
- Segment adapters: `odontologia` e fallback `generic`.
- Delivery operacional: `none`, `log`, `notify`, `approval`.
- Diagnóstico agrupado de conta central pendente.
- Histórico operacional por API.
- Painel web com histórico real e análise de campanhas.
- Árvore `Campanha -> Conjunto -> Criativo`.
- Normalização por IDs para preparar dados reais do Meta Ads.

---

## O que o projeto resolve hoje

```text
Escolher cliente/estado.
Escolher período.
Escolher campos.
Resolver aba correta.
Executar dry-run seguro.
Persistir histórico.
Criar notificação/aprovação interna.
Visualizar histórico no painel.
Analisar campanhas em estrutura hierárquica.
```

---

## O que ainda falta para operação real

```text
Configurar credenciais reais.
Configurar act real da conta Meta central.
Validar insights reais.
Validar service account Google.
Rodar primeira escrita real controlada.
Definir banco cloud se for SaaS multiusuário.
Ativar WhatsApp real somente depois de auditoria e aprovação confiáveis.
```

---

## Fase 0 — Gate de validação contínua

### Status

Ativo.

### Comandos obrigatórios

```bash
npm install
npm run check
npm test
```

### Critérios de aceite

- Todos os testes passam.
- `npm run check` passa.
- Scripts principais não quebram.
- Mudança relevante atualiza documentação.

---

## Fase 1 — Resolver data, mês e aba automaticamente

### Status

Implementada inicialmente.

### Entregue

- `src/domain/sheetResolver.js`.
- Resolução por estado, mês e ano.
- Fallback manual por `sheetName`.
- Testes de resolução de abas.

---

## Fase 2 — Modos operacionais de período

### Status

Implementada inicialmente.

### Entregue

- `--day`.
- `--today`.
- `--pending-month`.
- `--month-to-date`.
- `--since` e `--until`.
- Fuso operacional do cliente.
- `src/domain/dateRangeResolver.js`.
- Testes de período.

---

## Fase 3 — Personalização do que preencher

### Status

Implementada inicialmente.

### Entregue

- `--fields leads,value` como padrão.
- `--fields leads`.
- `--fields leads,value,cpl` somente quando solicitado.
- Preservação de CPL/fórmulas por padrão.

---

## Fase 4 — Delivery operacional

### Status

Implementada.

### Modos

```text
none       -> não entrega nada
log        -> registra resumo operacional no log
notify     -> cria notificação interna
approval   -> cria aprovação pendente e bloqueia escrita real
```

### Entregue

- `src/services/deliveryManager.js`.
- Testes do delivery.
- Integração com `dentalSheetFill`.
- Persistência de notificações/aprovações via `notificationCenter`.

---

## Fase 5 — Diagnóstico agrupado da conta Meta central

### Status

Implementada.

### Resultado atual

Em vez de listar dezenas de avisos, o sistema agrupa por estado:

```text
adAccountId pendente (BA) — 14 unidade(s)
adAccountId pendente (SP) — 37 unidade(s)
```

No Dental Fill, a conta central pendente também vira diagnóstico central:

```text
Dental Leads / SP: conta Meta central pendente. 37 clínicas dependem dessa conta.
```

---

## Fase 6 — Histórico operacional consultável

### Status

Implementada e validada via HTTP local.

### Endpoints

```http
GET /api/history/notifications
GET /api/history/job-runs
GET /api/history/unit-results
```

### Segurança

Os endpoints exigem token operacional.

### Serviço central

```text
src/services/historyService.js
```

### Resultado

- Histórico de notificações.
- Histórico de job runs.
- Histórico de resultados por unidade.
- Filtros por estado, status, companyId e jobRunId.
- Formato normalizado para dashboard.

---

## Fase 7 — Painel operacional

### Status

Implementação inicial entregue.

### Entregue

- Dashboard executivo.
- Campanhas.
- Criativos.
- Automação.
- WhatsApp mock.
- Histórico operacional real via endpoints protegidos.
- Campo de token operacional no navegador.

---

## Fase 8 — Análise de campanhas

### Status

Implementada inicialmente.

### Entregue

- Aba Campanhas em árvore:

```text
Campanha
  -> Conjunto
    -> Criativo
```

- Normalização por IDs:

```text
campaign.id
  -> adset.campaignId
    -> creative.adsetId
```

- Nomes usados para exibição e fallback.
- Mock já simula o formato esperado do Meta real.
- Teste de normalização em `src/web/__tests__/mockData.test.js`.

---

## Fase 9 — Laboratório Criativo

### Status

Próxima fase recomendada.

### Objetivo

Transformar a aba Criativos em painel de decisão:

```text
Vencedores
Atenção
Queimando verba
Testes sugeridos
```

### Critério

Não mexer em backend antes de consolidar a leitura visual.

---

## Fase 10 — Meta Ads real em staging

### Status

Pendente.

### Objetivo

Validar Meta real sem escrita no Google Sheets.

### Critérios

- Token real configurado.
- Conta `act` real configurada.
- Insights reais retornando.
- Campos reais conferidos:
  - campaign id/name;
  - adset id/name;
  - ad id/name;
  - spend;
  - leads/actions.
- Modelo normalizado compatível com painel atual.

---

## Fase 11 — Google Sheets real controlado

### Status

Pendente.

### Objetivo

Executar primeira escrita real com baixo risco.

### Ordem segura

1. Dry-run real com Meta.
2. Conferir ranges.
3. Rodar real para um dia e um estado.
4. Conferir planilha manualmente.
5. Conferir histórico no painel.
6. Ampliar gradualmente.

---

## Fase 12 — WhatsApp real

### Status

Pendente.

### Regra

WhatsApp real só deve entrar depois de:

- histórico funcional;
- approval funcional;
- primeira operação real mínima validada;
- mensagens e eventos bem definidos.

---

## Ordem recomendada imediata

```text
1. Atualizar documentação e alinhar estado do projeto.
2. Grupo 8.2 — Laboratório Criativo.
3. Grupo 9 — Meta Ads real em staging.
4. Grupo 10 — Google Sheets real controlado.
5. Grupo 11/12 — WhatsApp real e automações avançadas.
```
