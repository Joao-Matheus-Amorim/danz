# Fases Operacionais de Implementação — Tráfego Automator / Dental Leads

Este documento organiza as próximas mudanças em fases metódicas, considerando o estado atual do código, a planilha Dental Leads, a conta Meta Ads central compartilhada e a necessidade operacional de preencher períodos específicos sob demanda.

---

## Diagnóstico atual

O projeto já possui:

- Q1 parcialmente implementado: segurança, testes, CI, validação e retry.
- Q2 inicial implementado: SQLite local, notificações, execuções e resultados por unidade.
- M1 funcional: registry de empresa e clínicas por JSON.
- M2 funcional em dry-run: preenchimento literal Dental com suporte a conta Meta central e `campaignMatch`.
- Catálogo de abas da planilha por estado/mês em `data/companies/dental-leads.json`.

O próximo problema operacional não é criar outro módulo grande. O próximo problema é refinar o M2 para operar como serviço real:

```text
Escolher o que preencher.
Escolher de quando até quando preencher.
Escolher se envia ou não notificação.
Escolher se executa real ou apenas prepara para análise do gestor.
Resolver automaticamente a aba correta pelo mês/estado.
Evitar ruído quando a conta Meta central estiver pendente.
```

---

## Fase 0 — Gate de validação contínua

### Objetivo

Garantir que toda mudança continue passando nos critérios básicos.

### Comandos obrigatórios

```bash
npm install
npm run check
npm test
```

### Critérios de aceite

- Todos os testes passam.
- `npm run check` passa.
- CI remoto passa.
- Vercel não quebra.

---

## Fase 1 — Resolver data, mês e aba automaticamente

### Problema

Hoje o M2 recebe `--since` e `--until`, mas a escolha da aba ainda está presa ao `sheetName` configurado no arquivo do estado.

Para operação real, o sistema deve escolher a aba correta com base em:

```text
estado + data/mês/ano
```

Exemplos:

```text
SP + 2026-05-12 -> SP · MAIO
BA + 2026-05-12 -> Bahia · MAIO
SP + 2026-04-10 -> SP · Abril
BA + 2026-04-10 -> Bahia · Abril
```

### Implementação

Criar:

```text
src/domain/sheetResolver.js
```

Responsabilidades:

- Ler `sheetCatalog` da empresa.
- Resolver `sheetName` por estado, mês e ano.
- Validar quando não existir aba para o período solicitado.
- Suportar fallback manual por `--sheetName` no futuro.

### Critérios de aceite

- Rodar maio usa abas de maio.
- Rodar abril usa abas de abril.
- Se não existir aba para o mês, retorna erro claro.
- Documentação e testes cobrem a resolução.

---

## Fase 2 — Modos operacionais de período

### Objetivo

Permitir escolher exatamente de quando preencher.

### Modos necessários

#### 2.1 Dia específico

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10
```

Equivale a:

```text
since=2026-05-10
until=2026-05-10
```

#### 2.2 Intervalo customizado

```bash
npm run dental:fill:dry -- --state SP --since 2026-05-01 --until 2026-05-06
```

#### 2.3 Hoje

```bash
npm run dental:fill:dry -- --state SP --today
```

Em 12/05/2026, equivale a:

```text
2026-05-12 até 2026-05-12
```

#### 2.4 Mês pendente até ontem

```bash
npm run dental:fill:dry -- --state SP --pending-month
```

Em 12/05/2026, equivale a:

```text
2026-05-01 até 2026-05-11
```

#### 2.5 Mês até hoje

```bash
npm run dental:fill:dry -- --state SP --month-to-date
```

Em 12/05/2026, equivale a:

```text
2026-05-01 até 2026-05-12
```

### Implementação

Criar:

```text
src/domain/dateRangeResolver.js
```

Atualizar:

```text
src/utils/cli.js
src/index.js
```

### Critérios de aceite

- `--day` funciona.
- `--today` funciona.
- `--pending-month` funciona.
- `--month-to-date` funciona.
- `--since/--until` continua funcionando.
- Testes cobrem cada modo.

---

## Fase 3 — Personalização do que preencher

### Objetivo

Permitir escolher quais campos preencher na planilha.

### Campos possíveis

```text
leads
value
cpl
```

Por padrão:

```text
leads,value
```

Porque o CPL deve continuar como fórmula da planilha.

### Exemplos

Preencher apenas leads:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads
```

Preencher leads e valor:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads,value
```

Nunca preencher CPL, exceto se explicitamente habilitado:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads,value,cpl
```

### Implementação

Atualizar:

```text
src/jobs/dentalSheetFill.js
src/utils/cli.js
```

### Critérios de aceite

- Campo padrão continua `leads,value`.
- `cpl` só é escrito se solicitado.
- Fórmulas existentes não são sobrescritas sem autorização explícita.

---

## Fase 4 — Modo gestor / sem envio

### Objetivo

Permitir rodar o preenchimento ou preparação sem enviar alerta para gestor/cliente.

### Modos de entrega

```text
none       -> não envia nada
log        -> registra no banco/local, mas não envia
notify     -> envia notificação/WhatsApp quando módulo estiver habilitado
approval   -> cria pendência para gestor aprovar antes de envio/ação
```

### Exemplo

```bash
npm run dental:fill:dry -- --state SP --today --delivery none
```

### Critérios de aceite

- `delivery=none` não dispara WhatsApp.
- `delivery=log` salva histórico, mas não notifica.
- `delivery=notify` fica reservado para M4.
- `approval` fica reservado para painel/gestor.

---

## Fase 5 — Diagnóstico agrupado da conta Meta central

### Problema

Quando a conta Meta central está pendente, o sistema hoje pula cada clínica individualmente, gerando ruído.

### Resultado desejado

```text
Dental Leads / SP
Conta Meta central pendente: act_PREENCHER_CONTA_CENTRAL
37 clínicas dependem dessa conta.
Nenhuma unidade será processada até configurar o act_... real.
```

### Implementação

Criar diagnóstico antes do loop por unidade:

```text
validar grupos por companyId + state + sharedAdAccountId
```

### Critérios de aceite

- Uma mensagem por grupo/estado.
- Resultados persistidos como skipped em lote.
- Menos ruído no terminal.
- Logs claros no SQLite.

---

## Fase 6 — Histórico operacional consultável

### Objetivo

Transformar a persistência Q2 em algo consultável por API.

### Endpoints previstos

```http
GET /api/history/notifications
GET /api/history/job-runs
GET /api/history/unit-results
```

### Segurança

Esses endpoints devem exigir token operacional.

### Critérios de aceite

- Consultar últimas notificações.
- Consultar últimas execuções.
- Consultar resultados por clínica/unidade.
- Filtrar por estado, status e jobRunId futuramente.

---

## Fase 7 — Primeiro teste real controlado

### Objetivo

Validar Meta Ads e Google Sheets reais com risco baixo.

### Pré-requisitos

- `META_ACCESS_TOKEN` configurado.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` configurado.
- `GOOGLE_PRIVATE_KEY` configurado.
- Planilha compartilhada com a Service Account.
- `act_...` real da conta Meta central configurado.

### Ordem segura

1. Rodar `registry:validate`.
2. Rodar `dental:fill:dry` para 1 dia.
3. Conferir se `matchedRows > 0` para clínicas com campanha.
4. Rodar real para 1 dia e 1 estado.
5. Conferir a planilha manualmente.
6. Só depois ampliar intervalo.

---

## Fase 8 — Backfill operacional do mês

### Objetivo

Permitir preencher a demanda atrasada do mês.

Exemplos:

```bash
npm run dental:fill -- --state SP --since 2026-05-01 --until 2026-05-06 --delivery none
npm run dental:fill -- --state SP --day 2026-05-10 --delivery none
npm run dental:fill -- --state SP --pending-month --delivery none
```

### Critérios de aceite

- Preencher dia único.
- Preencher intervalo curto.
- Preencher mês pendente até ontem.
- Não enviar mensagens se `delivery=none`.
- Persistir histórico de tudo.

---

## Fase 9 — Métricas detalhadas / abas auxiliares

### Objetivo

Depois que a planilha literal estiver confiável, criar abas auxiliares:

```text
Campanhas
Conjuntos
Criativos
Alertas
Log Execuções
Config
```

### Regra

Essas abas não substituem a planilha literal. Elas complementam auditoria e análise.

---

## Fase 10 — WhatsApp API

### Objetivo

Somente depois da operação estar persistida e auditável, ligar envio real.

### Eventos iniciais

- Planilha atualizada.
- Erro em clínica.
- Resumo diário.
- Resumo semanal.
- Alerta de CPL alto.
- Campanha sem lead.

---

## Fase 11 — Painel Admin e Cliente

### Objetivo

Criar interface para:

- ver histórico;
- ver clínicas;
- rodar comandos;
- aprovar envios;
- configurar módulos;
- dar acesso somente leitura ao cliente.

---

## Ordem recomendada imediata

A próxima execução deve seguir esta ordem:

```text
1. Fase 1 — Sheet resolver por data/mês/estado.
2. Fase 2 — Modos operacionais de período.
3. Fase 3 — Campos personalizáveis.
4. Fase 5 — Diagnóstico agrupado da conta central.
5. Fase 6 — Endpoints de histórico.
6. Fase 7 — Teste real controlado.
```

Fase 4 pode ser simples no começo, porque o padrão atual já não envia WhatsApp real se o módulo não estiver habilitado. Mesmo assim, o parâmetro `--delivery none` deve entrar para deixar a intenção operacional explícita.
