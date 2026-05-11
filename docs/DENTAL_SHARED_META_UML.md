# UML — Dental Leads com Conta Meta Central Compartilhada

Este documento descreve o fluxo arquitetural específico do caso Dental Leads, onde uma única conta Meta Ads central contém campanhas de múltiplas clínicas/unidades.

---

## 1. Decisão arquitetural

A Dental Leads não será modelada como uma conta de anúncio por clínica.

O modelo operacional é:

```text
Empresa Dental Leads
  -> conta Meta Ads central
      -> campanhas representam clínicas/unidades
          -> campaignMatch identifica a clínica correta
              -> Leads e Valor são preenchidos na planilha literal
```

---

## 2. Visão geral do fluxo

```mermaid
flowchart TD
  Company[Empresa Dental Leads] --> Registry[Registry de clínicas]
  Registry --> SP[SP - Clínicas]
  Registry --> BA[Bahia - Clínicas]

  Company --> MetaAccount[Conta Meta Ads Central]
  MetaAccount --> Campaigns[Campanhas Meta Ads]

  SP --> UnitMatchSP[campaignMatch por clínica]
  BA --> UnitMatchBA[campaignMatch por clínica]

  Campaigns --> Collector[Meta Collector level=campaign]
  Collector --> Matcher[Campaign Matcher]

  UnitMatchSP --> Matcher
  UnitMatchBA --> Matcher

  Matcher --> Aggregator[Agregador diário Leads + Valor]
  Aggregator --> SheetWriter[Dental Sheet Writer]
  SheetWriter --> Sheets[Google Sheets - Planilha Literal]

  SheetWriter --> Logs[Log de execução]
```

---

## 3. Componentes envolvidos

```mermaid
flowchart LR
  subgraph Configuração
    CompanyConfig[data/companies/dental-leads.json]
    SPConfig[data/clients/servicos/odontologia/sp/dental-leads-sp.json]
    BAConfig[data/clients/servicos/odontologia/ba/dental-leads-ba.json]
  end

  subgraph Core
    CompanyLoader[companyLoader.js]
    ClientRegistry[clientRegistry.js]
    ColumnUtils[sheetsColumns.js]
    DentalJob[dentalSheetFill.js]
  end

  subgraph Serviços
    MetaAds[metaAds.js]
    GoogleSheets[googleSheets.js]
  end

  CompanyConfig --> CompanyLoader
  SPConfig --> ClientRegistry
  BAConfig --> ClientRegistry
  ClientRegistry --> ColumnUtils
  ClientRegistry --> DentalJob
  DentalJob --> MetaAds
  DentalJob --> GoogleSheets
```

---

## 4. Diagrama de classes do caso Dental

```mermaid
classDiagram
  class Company {
    +string id
    +string name
    +string segment
    +string defaultGroup
    +boolean enabled
    +string spreadsheetId
  }

  class ClientGroup {
    +string companyId
    +string group
    +string segment
    +string state
    +string spreadsheetId
    +string sheetName
    +number rowOffset
    +MetaConfig meta
    +ColumnLayout columnLayout
    +Modules modules
    +Unit[] units
  }

  class MetaConfig {
    +string mode
    +string adAccountId
    +string insightLevel
    +string unitMatchField
  }

  class Unit {
    +string key
    +string name
    +string city
    +string state
    +string sheetName
    +string adAccountId
    +CampaignMatch campaignMatch
    +Columns columns
  }

  class CampaignMatch {
    +string[] ids
    +string[] exact
    +string[] contains
  }

  class Columns {
    +string leads
    +string cpl
    +string value
  }

  class ColumnLayout {
    +string firstColumn
    +number unitWidth
    +string[] fields
  }

  class DentalSheetFillJob {
    +fillDentalSheet(scope, since, until, dryRun)
    +getRowsForDay(unit, day)
    +filterRowsForUnit(rows, unit)
    +metricMatchesUnit(row, unit)
    +totalsFromRows(rows)
  }

  class CampaignMetric {
    +string campaign_id
    +string campanha
    +number gasto
    +number leads
    +number cpl
    +date data_inicio
    +date data_fim
  }

  Company "1" --> "many" ClientGroup
  ClientGroup --> MetaConfig
  ClientGroup --> ColumnLayout
  ClientGroup "1" --> "many" Unit
  Unit --> CampaignMatch
  Unit --> Columns
  DentalSheetFillJob --> Unit
  DentalSheetFillJob --> CampaignMetric
```

---

## 5. Sequência — Preenchimento por conta central

```mermaid
sequenceDiagram
  participant CLI as CLI dental:fill
  participant Registry as ClientRegistry
  participant Job as DentalSheetFillJob
  participant Meta as MetaAdsClient
  participant Matcher as CampaignMatcher
  participant Sheets as GoogleSheetsClient
  participant Log as Logger

  CLI->>Registry: Carregar unidades por scope
  Registry-->>CLI: Unidades SP/BA filtradas
  CLI->>Job: fillDentalSheet(scope, since, until, dryRun)

  loop Para cada unidade/clínica
    Job->>Job: Herdar meta.adAccountId central
    Job->>Meta: getInsights(level=campaign, adAccountId central, dia)
    Meta-->>Job: Lista de campanhas do dia
    Job->>Matcher: Filtrar por campaignMatch da clínica
    Matcher-->>Job: Campanhas correspondentes
    Job->>Job: Somar leads e gasto
    Job->>Job: Calcular range Leads e Valor
  end

  Job->>Sheets: batchUpdate apenas em Leads e Valor
  Sheets-->>Job: Resultado de escrita
  Job->>Log: Registrar sucesso/falha por unidade
  Job-->>CLI: Resumo final
```

---

## 6. Máquina de estados — Unidade no preenchimento Dental

```mermaid
stateDiagram-v2
  [*] --> Loaded
  Loaded --> Skipped: adAccountId pendente
  Loaded --> FetchingMeta: adAccountId válido
  FetchingMeta --> MatchingCampaigns
  MatchingCampaigns --> Aggregating
  Aggregating --> PreparingSheetRanges
  PreparingSheetRanges --> Success
  FetchingMeta --> Error
  MatchingCampaigns --> Error
  PreparingSheetRanges --> Error
  Skipped --> [*]
  Success --> [*]
  Error --> [*]
```

---

## 7. Fluxo de dados detalhado

```mermaid
flowchart LR
  A[Conta Meta Central act_...] --> B[Insights level=campaign]
  B --> C[Campanha: Dental SP Pimentas]
  B --> D[Campanha: Dental SP Tatuapé]
  B --> E[Campanha: Dental BA Camaçari]

  C --> F{campaignMatch Pimentas?}
  D --> G{campaignMatch Tatuapé?}
  E --> H{campaignMatch Camaçari?}

  F --> I[Somar Leads/Gasto Pimentas]
  G --> J[Somar Leads/Gasto Tatuapé]
  H --> K[Somar Leads/Gasto Camaçari]

  I --> L[SP · MAIO C/E]
  J --> M[SP · MAIO BT/BV]
  K --> N[Bahia · MAIO R/T]
```

---

## 8. Regras arquiteturais

1. A conta Meta central é herdada pelo grupo de unidades.
2. A clínica/unidade não precisa possuir `adAccountId` próprio.
3. Toda unidade em conta compartilhada precisa de `campaignMatch`.
4. A coleta principal para a planilha literal usa `level=campaign`.
5. O filtro por clínica acontece depois da coleta.
6. A escrita na planilha deve alterar apenas `Leads` e `Valor`.
7. Fórmulas de CPL e totais devem ser preservadas.
8. Erro em uma clínica não deve parar as demais.
9. `dry-run` deve mostrar ranges antes de qualquer escrita real.

---

## 9. Critérios de aceite arquitetural

Este fluxo estará arquiteturalmente aceito quando:

- o registry carregar SP e Bahia;
- cada unidade herdar a conta Meta central;
- cada unidade possuir `campaignMatch`;
- o job buscar campanhas na conta central;
- o matcher separar campanhas por clínica;
- o agregador somar leads e gasto por dia;
- o writer preencher apenas Leads e Valor;
- os documentos README, Roadmap, M2 e UML estiverem coerentes.
