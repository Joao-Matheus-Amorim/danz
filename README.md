# Tráfego Automator

Plataforma de automação operacional para gestão de tráfego pago, com foco inicial no caso **Dental Leads**: empresa odontológica com clínicas em múltiplos estados, uma conta Meta Ads central e uma planilha literal que precisa ser preenchida diariamente para prestação do serviço.

---

## Gate atual de qualidade

Antes de conectar Meta Ads, Google Sheets e WhatsApp em produção, o projeto deve concluir a **Q1 — Fundação de Qualidade, Segurança e Testes**.

Issue oficial:

```text
#1 — Sprint 1: Fundação de Qualidade, Segurança e Testes antes das integrações reais
```

Bloqueadores atuais para produção:

- token Meta ainda precisa migrar para `Authorization: Bearer`;
- testes unitários ainda precisam ser adicionados;
- CI/CD ainda precisa rodar `npm run check` e `npm test`;
- endpoints operacionais precisam de proteção/rate limit;
- notificações e execuções ainda precisam de persistência;
- payloads POST precisam de validação formal;
- retry para falhas transitórias da Meta API precisa ser implementado.

Enquanto Q1 não estiver concluída, integrações reais devem ser tratadas como **staging/controladas**, não produção.

---

## Decisão arquitetural atual

A planilha **Dental Leads** é o contrato principal da automação.

O sistema deve se adaptar ao layout da planilha, sem destruir formatação, fórmulas, totais, cabeçalhos ou organização visual do cliente.

No caso Dental atual, a estrutura correta é:

```text
Dental Leads
  -> uma conta Meta Ads central
  -> campanhas representam clínicas/unidades
  -> cada clínica é identificada por filtro de campanha
  -> Leads e Valor são escritos na coluna correta da planilha
```

Uma clínica não precisa ter uma conta de anúncio própria. Ela pode ser uma unidade operacional dentro da mesma conta Meta, identificada por nome ou ID de campanha.

---

## Estado atual

### Implementado

- Dashboard demo e API mock.
- Cliente Meta Ads estruturado para insights reais.
- Cliente Google Sheets estruturado para escrita em planilhas.
- Empresa `Dental Leads` em `data/companies/dental-leads.json`.
- Clínicas SP e Bahia em:
  - `data/clients/servicos/odontologia/sp/dental-leads-sp.json`
  - `data/clients/servicos/odontologia/ba/dental-leads-ba.json`
- M1 Registry:
  - loader de empresas;
  - loader de clínicas;
  - validação de registry;
  - filtros por empresa, grupo, segmento, estado, cidade e módulo;
  - derivação automática de colunas da planilha.
- M2 Dental Sheet:
  - conta Meta Ads compartilhada;
  - filtro de campanhas por clínica via `campaignMatch`;
  - escrita cirúrgica em `Leads` e `Valor`;
  - preservação de CPL, totais e formatação;
  - suporte a `dry-run`.

### Pendente para produção

- Concluir Q1 — segurança, testes, CI/CD e validação.
- Informar o `act_...` real da conta Meta central.
- Configurar `META_ACCESS_TOKEN`.
- Configurar Service Account Google Sheets.
- Validar leitura real do Meta Ads em staging.
- Validar escrita real na planilha em staging.
- Criar logs persistentes.
- Criar WhatsApp API real.
- Criar login, painel Admin e contas somente leitura.
- Criar banco de dados.

---

## Comandos principais

Instalar dependências:

```bash
npm install
```

Validar sintaxe:

```bash
npm run check
```

Rodar dashboard demo:

```bash
npm start
```

---

## M1 — Registry de empresas e clínicas

Listar todas as unidades:

```bash
npm run registry:list
```

Listar por estado:

```bash
npm run registry:list -- --state SP
npm run registry:list -- --state BA
```

Listar por empresa, segmento ou módulo:

```bash
npm run registry:list -- --company cmp_dental_leads
npm run registry:list -- --segment odontologia
npm run registry:list -- --module fillDentalSheet
```

Validar cadastro:

```bash
npm run registry:validate
```

Enquanto a conta Meta central estiver como `act_PREENCHER_CONTA_CENTRAL`, a validação deve avisar que o `adAccountId` está pendente.

---

## M2 — Preenchimento literal Dental

Dry-run geral:

```bash
npm run dental:fill:dry -- --since 2026-05-01 --until 2026-05-11
```

Dry-run por estado:

```bash
npm run dental:fill:dry -- --state SP --since 2026-05-01 --until 2026-05-11
npm run dental:fill:dry -- --state BA --since 2026-05-01 --until 2026-05-11
```

Execução real controlada:

```bash
npm run dental:fill -- --state SP --since 2026-05-01 --until 2026-05-11
```

A execução real exige Q1 concluída, credenciais Meta Ads e Google Sheets configuradas no `.env`.

---

## Conta Meta central compartilhada

Nos arquivos Dental, o estado usa uma conta central:

```json
{
  "meta": {
    "mode": "shared_ad_account",
    "adAccountId": "act_PREENCHER_CONTA_CENTRAL",
    "insightLevel": "campaign",
    "unitMatchField": "campaign_name"
  }
}
```

Cada clínica define como encontrar suas campanhas:

```json
{
  "key": "pimentas",
  "name": "Pimentas",
  "campaignMatch": {
    "contains": ["Pimentas"]
  }
}
```

Também é possível mapear por ID:

```json
{
  "campaignMatch": {
    "ids": ["1234567890", "9876543210"]
  }
}
```

---

## Estrutura atual

```text
data/
  companies/
    dental-leads.json
  clients/
    servicos/
      odontologia/
        sp/dental-leads-sp.json
        ba/dental-leads-ba.json

docs/
  PMBOK_PROJECT_MANAGEMENT_PLAN.md
  FUNCTIONAL_REQUIREMENTS.md
  SYSTEM_ARCHITECTURE_UML.md
  ROADMAP.md
  DENTAL_SHARED_META_UML.md
  M1_CLIENT_REGISTRY_MODULE.md
  M2_DENTAL_SHEET_AUTOMATION_SPEC.md

src/
  config/
    clientRegistry.js
    companyLoader.js
    clients.js
    rules.js
  domain/
    modules.js
    metrics.js
    analyzer.js
  jobs/
    dentalSheetFill.js
    fillSheetOnly.js
    syncSheets.js
    analyzeCampaigns.js
    buildDashboard.js
    checkAlerts.js
  services/
    metaAds.js
    googleSheets.js
    metaActions.js
    notificationCenter.js
  utils/
    cli.js
    date.js
    logger.js
    sheetsColumns.js
```

---

## Governança documental

A partir deste marco, cada bloco completo de construção deve atualizar:

1. `README.md` — estado operacional e comandos atuais;
2. documento funcional/técnico correspondente em `docs/`;
3. `docs/SYSTEM_ARCHITECTURE_UML.md` ou UML específico — quando houver mudança arquitetural, fluxo ou entidade;
4. `docs/ROADMAP.md`.

Um bloco só é considerado completo quando código e documentação estão coerentes.

---

## Roadmap atualizado

1. **Q1 Fundação de Qualidade** — prioridade máxima antes de produção.
2. **Q2 Persistência Local** — SQLite para notificações, execuções e histórico mínimo.
3. **M1 Registry** — funcional via JSON/CLI.
4. **M2 Dental Sheet literal** — funcional via JSON/CLI e dry-run.
5. **M3 Métricas detalhadas** — bloqueado por Q1/Q2.
6. **M4 WhatsApp API** — bloqueado por Q1/Q2.
7. **M5 Painel Admin/Cliente** — cadastro visual, usuários, permissões e execução manual.
8. **M6 Módulos Admin avançados** — upload de criativos, criação de campanhas e pausa com aprovação.
