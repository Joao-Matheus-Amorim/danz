# Documento de Arquitetura UML — Tráfego Automator

---

## 1. Objetivo

Este documento descreve a arquitetura alvo do Tráfego Automator usando diagramas UML/Mermaid. O objetivo é orientar a evolução do projeto para uma plataforma multi-cliente, modular, segura e escalável.

---

## 2. Visão Arquitetural Geral

```mermaid
flowchart TD
  subgraph Users[Usuários]
    SuperAdmin[Super Admin]
    Operator[Operador Admin]
    ClientViewer[Conta Cliente Somente Leitura]
  end

  subgraph Web[Aplicação Web]
    AdminPanel[Painel Admin]
    ClientPanel[Painel Cliente]
  end

  subgraph API[Backend API]
    Auth[Auth e Sessão]
    ClientAPI[Clientes API]
    ModuleAPI[Módulos API]
    MetricsAPI[Métricas API]
    SheetsAPI[Planilhas API]
    WhatsAppAPI[WhatsApp API Service]
    ActionsAPI[Ações Admin]
    AuditAPI[Auditoria API]
  end

  subgraph Core[Core do Sistema]
    ClientLoader[Client Loader]
    PermissionEngine[Permission Engine]
    ModuleEngine[Module Engine]
    JobRunner[Job Runner por Escopo]
    BatchProcessor[Batch Processor]
    Analyzer[Analyzer de Criativos]
  end

  subgraph Data[Dados]
    DB[(Banco de Dados)]
    ConfigFiles[(Configuração JSON inicial)]
    Logs[(Logs/Auditoria)]
  end

  subgraph Integrations[Integrações]
    Meta[Meta Ads API]
    Sheets[Google Sheets API]
    WA[WhatsApp API]
  end

  SuperAdmin --> AdminPanel
  Operator --> AdminPanel
  ClientViewer --> ClientPanel

  AdminPanel --> API
  ClientPanel --> API

  Auth --> DB
  ClientAPI --> ClientLoader
  ModuleAPI --> ModuleEngine
  MetricsAPI --> JobRunner
  SheetsAPI --> JobRunner
  WhatsAppAPI --> WA
  ActionsAPI --> PermissionEngine
  AuditAPI --> Logs

  ClientLoader --> ConfigFiles
  ClientLoader --> DB
  JobRunner --> PermissionEngine
  JobRunner --> ModuleEngine
  JobRunner --> BatchProcessor
  BatchProcessor --> Meta
  BatchProcessor --> Sheets
  BatchProcessor --> WhatsAppAPI
  Analyzer --> BatchProcessor

  PermissionEngine --> DB
  ModuleEngine --> DB
  BatchProcessor --> Logs
```

---

## 3. Organização de Clientes

```mermaid
flowchart LR
  Root[Clientes] --> Admin[Admin]
  Root --> Servicos[Serviços]

  Admin --> AdminSP[SP]
  Admin --> AdminBA[Bahia]
  Servicos --> ServicosSP[SP]
  Servicos --> ServicosBA[Bahia]

  AdminSP --> AdminSPClinicas[Clínicas SP]
  AdminSP --> AdminSPOticas[Óticas SP]
  ServicosSP --> ServicosSPClinicas[Clínicas SP]
  ServicosBA --> ServicosBAClinicas[Clínicas Bahia]

  AdminSPClinicas --> ClienteA[Clínica Admin A]
  ServicosSPClinicas --> ClienteB[Clínica Serviços B]
  ServicosBAClinicas --> ClienteC[Clínica Serviços C]
```

---

## 4. Arquitetura por Camadas

```mermaid
flowchart TD
  Presentation[Camada de Apresentação
  Painel Admin / Painel Cliente] --> Application[Camada de Aplicação
  Casos de uso / APIs]

  Application --> Domain[Camada de Domínio
  Cliente, Módulo, Permissão, Métricas, Alertas]

  Domain --> Infrastructure[Camada de Infraestrutura
  Meta Ads, Google Sheets, WhatsApp, Banco, Logs]

  Infrastructure --> External[Serviços Externos
  Meta Ads API / Sheets API / WhatsApp API]
```

---

## 5. Diagrama de Classes — Domínio Principal

```mermaid
classDiagram
  class Client {
    +string id
    +string key
    +string name
    +string group
    +string region
    +string segment
    +boolean enabled
    +MetaConfig meta
    +SheetConfig sheets
    +WhatsappConfig whatsapp
    +Rules rules
    +Modules modules
  }

  class Modules {
    +boolean pullMetaMetrics
    +boolean fillSheet
    +boolean sendWhatsappReport
    +boolean analyzeCreatives
    +boolean checkBalance
    +boolean uploadCreative
    +boolean createCampaign
    +boolean createAdset
    +boolean pauseAds
    +boolean createTestCampaign
  }

  class Rules {
    +number maxCpl
    +number minCtr
    +number maxSpendWithoutLead
    +number minBalance
    +boolean requireApproval
    +number maxDailyBudgetCents
  }

  class MetaConfig {
    +string adAccountId
    +string businessId
    +string pixelId
  }

  class SheetConfig {
    +string spreadsheetId
    +string tabPrefix
    +string template
  }

  class WhatsappConfig {
    +boolean enabled
    +string to
    +string provider
  }

  class User {
    +string id
    +string name
    +string email
    +string role
    +boolean active
    +Scope scope
    +UserPermissions permissions
  }

  class Scope {
    +string[] groups
    +string[] regions
    +string[] segments
    +string[] clients
  }

  class UserPermissions {
    +boolean viewDashboard
    +boolean editClient
    +boolean editModules
    +boolean pullMetaMetrics
    +boolean fillSheet
    +boolean sendWhatsappReport
    +boolean uploadCreative
    +boolean createCampaign
    +boolean pauseAds
    +boolean manageUsers
  }

  class CampaignMetric {
    +string campaignId
    +string campaignName
    +number spend
    +number leads
    +number cpl
    +number impressions
    +number clicks
    +number ctr
    +number roi
    +date dateStart
    +date dateEnd
  }

  class AdsetMetric {
    +string campaignId
    +string adsetId
    +string adsetName
    +number spend
    +number leads
    +number cpl
    +number impressions
    +number clicks
    +number ctr
  }

  class CreativeMetric {
    +string campaignId
    +string adsetId
    +string adId
    +string adName
    +number spend
    +number leads
    +number cpl
    +number impressions
    +number clicks
    +number ctr
    +string analysisStatus
    +string recommendation
  }

  class Notification {
    +string id
    +string clientId
    +string channel
    +string type
    +string destination
    +string status
    +datetime sentAt
  }

  class AuditLog {
    +string id
    +string actorUserId
    +string clientId
    +string action
    +string status
    +datetime createdAt
    +object metadata
  }

  Client --> Modules
  Client --> Rules
  Client --> MetaConfig
  Client --> SheetConfig
  Client --> WhatsappConfig
  User --> Scope
  User --> UserPermissions
  Client "1" --> "many" CampaignMetric
  Client "1" --> "many" AdsetMetric
  Client "1" --> "many" CreativeMetric
  Client "1" --> "many" Notification
  User "1" --> "many" AuditLog
  Client "1" --> "many" AuditLog
```

---

## 6. Caso de Uso — Visão Geral

```mermaid
flowchart TD
  SuperAdmin((Super Admin)) --> UC1[Gerenciar clientes]
  SuperAdmin --> UC2[Gerenciar módulos]
  SuperAdmin --> UC3[Gerenciar usuários]
  SuperAdmin --> UC4[Executar rotinas por escopo]
  SuperAdmin --> UC5[Ver logs e auditoria]

  Operator((Operador Admin)) --> UC4
  Operator --> UC6[Preencher planilhas]
  Operator --> UC7[Enviar WhatsApp]
  Operator --> UC8[Analisar criativos]
  Operator --> UC9[Executar ações avançadas]

  ClientViewer((Cliente Leitura)) --> UC10[Ver dashboard]
  ClientViewer --> UC11[Ver campanhas]
  ClientViewer --> UC12[Ver conjuntos]
  ClientViewer --> UC13[Ver criativos]
  ClientViewer --> UC14[Ver alertas]
  ClientViewer --> UC15[Ver relatórios]
```

---

## 7. Sequência — Execução Meta Ads para Google Sheets

```mermaid
sequenceDiagram
  participant U as Operador/Admin
  participant API as Backend API
  participant P as Permission Engine
  participant C as Client Loader
  participant R as Job Runner
  participant M as Meta Ads API
  participant S as Google Sheets API
  participant L as Logs

  U->>API: Executar sync group=servicos region=sp segment=clinicas
  API->>P: Validar permissão do usuário
  P-->>API: Permissão aprovada
  API->>C: Carregar clientes do escopo
  C-->>API: Lista de clientes
  API->>R: Processar clientes em lote

  loop Para cada cliente
    R->>P: Verificar módulo pullMetaMetrics + fillSheet
    P-->>R: Aprovado/Bloqueado
    R->>M: Buscar insights campaign
    M-->>R: Campanhas
    R->>M: Buscar insights adset
    M-->>R: Conjuntos
    R->>M: Buscar insights ad
    M-->>R: Criativos
    R->>R: Normalizar métricas
    R->>S: Escrever abas Campanhas/Conjuntos/Criativos
    S-->>R: Resultado da atualização
    R->>L: Registrar execução do cliente
  end

  R-->>API: Resumo final
  API-->>U: Sucesso/falhas por cliente
```

---

## 8. Sequência — Envio WhatsApp por Alerta

```mermaid
sequenceDiagram
  participant R as Job Runner
  participant A as Analyzer
  participant P as Permission Engine
  participant W as WhatsApp Service
  participant WA as WhatsApp API
  participant L as Logs

  R->>A: Analisar métricas de criativos
  A-->>R: Alertas gerados

  loop Para cada alerta
    R->>P: Verificar módulo sendWhatsappReport
    P-->>R: Aprovado/Bloqueado
    R->>W: Montar mensagem do alerta
    W->>WA: Enviar mensagem
    WA-->>W: Status de envio
    W->>L: Registrar notificação
  end
```

---

## 9. Sequência — Ação Avançada Admin

```mermaid
sequenceDiagram
  participant U as Usuário Admin
  participant API as Backend API
  participant P as Permission Engine
  participant A as Approval Engine
  participant Meta as Meta Actions API
  participant L as Audit Log

  U->>API: Solicita pausar anúncio
  API->>P: Verificar cliente.modules.pauseAds
  P->>P: Verificar user.permissions.pauseAds
  P->>P: Verificar escopo do usuário
  P-->>API: Autorizado
  API->>A: Verificar se exige aprovação

  alt Requer aprovação
    A-->>API: Criar solicitação pendente
    API-->>U: Ação pendente de aprovação
  else Não requer aprovação
    API->>Meta: Pausar anúncio
    Meta-->>API: Resultado
    API->>L: Registrar auditoria
    API-->>U: Ação executada
  end
```

---

## 10. Máquina de Estados — Execução de Job

```mermaid
stateDiagram-v2
  [*] --> Created
  Created --> Running
  Running --> PartialSuccess
  Running --> Success
  Running --> Failed
  PartialSuccess --> Finished
  Success --> Finished
  Failed --> Finished
  Finished --> [*]
```

---

## 11. Máquina de Estados — Ação Avançada

```mermaid
stateDiagram-v2
  [*] --> Requested
  Requested --> PermissionDenied
  Requested --> PendingApproval
  Requested --> Executing
  PendingApproval --> Approved
  PendingApproval --> Rejected
  Approved --> Executing
  Executing --> Executed
  Executing --> Failed
  PermissionDenied --> [*]
  Rejected --> [*]
  Executed --> [*]
  Failed --> [*]
```

---

## 12. Diagrama de Componentes

```mermaid
flowchart TD
  subgraph Backend
    AuthComponent[Auth Component]
    ClientComponent[Client Component]
    ModuleComponent[Module Component]
    PermissionComponent[Permission Component]
    MetaComponent[Meta Ads Component]
    SheetsComponent[Google Sheets Component]
    WhatsAppComponent[WhatsApp Component]
    JobComponent[Job Component]
    AuditComponent[Audit Component]
  end

  AuthComponent --> PermissionComponent
  ClientComponent --> ModuleComponent
  JobComponent --> ClientComponent
  JobComponent --> PermissionComponent
  JobComponent --> MetaComponent
  JobComponent --> SheetsComponent
  JobComponent --> WhatsAppComponent
  JobComponent --> AuditComponent
  MetaComponent --> AuditComponent
  SheetsComponent --> AuditComponent
  WhatsAppComponent --> AuditComponent
```

---

## 13. Estrutura de Pastas Alvo

```text
src/
  config/
    clientLoader.js
    moduleDefaults.js
    rulesDefaults.js

  security/
    roles.js
    permissions.js
    scope.js
    authorization.js

  domain/
    metrics.js
    analyzer.js
    modules.js
    clients.js

  services/
    metaAds.js
    metaActions.js
    googleSheets.js
    whatsappApi.js
    auditLog.js

  jobs/
    pullMetaMetrics.js
    fillSheetsFromMeta.js
    analyzeCreatives.js
    sendWhatsappAlerts.js
    runClientScope.js

  web/
    server.js
    mockData.js

  repositories/
    clientRepository.js
    userRepository.js
    executionRepository.js
    auditRepository.js

data/
  clients/
    admin/
      sp/
        clinicas-sp.json
      bahia/
        clinicas-bahia.json
    servicos/
      sp/
        clinicas-sp.json
      bahia/
        clinicas-bahia.json
  users.json
```

---

## 14. Modelo de Banco Futuro

```mermaid
erDiagram
  CLIENTS ||--o{ CLIENT_USERS : has
  USERS ||--o{ CLIENT_USERS : belongs
  CLIENTS ||--o{ CLIENT_MODULES : has
  MODULES ||--o{ CLIENT_MODULES : enabled
  CLIENTS ||--o{ CAMPAIGN_METRICS : owns
  CLIENTS ||--o{ ADSET_METRICS : owns
  CLIENTS ||--o{ CREATIVE_METRICS : owns
  CLIENTS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ AUDIT_LOGS : acts
  CLIENTS ||--o{ AUDIT_LOGS : target
  EXECUTIONS ||--o{ EXECUTION_CLIENT_RESULTS : contains
  CLIENTS ||--o{ EXECUTION_CLIENT_RESULTS : processed

  CLIENTS {
    string id
    string key
    string name
    string group
    string region
    string segment
    boolean enabled
  }

  USERS {
    string id
    string name
    string email
    string role
    boolean active
  }

  MODULES {
    string id
    string key
    string name
    string description
  }

  CLIENT_MODULES {
    string client_id
    string module_id
    boolean enabled
  }

  CAMPAIGN_METRICS {
    string client_id
    string campaign_id
    string campaign_name
    number spend
    number leads
    number cpl
    date date_start
    date date_end
  }

  ADSET_METRICS {
    string client_id
    string campaign_id
    string adset_id
    string adset_name
    number spend
    number leads
    number cpl
  }

  CREATIVE_METRICS {
    string client_id
    string campaign_id
    string adset_id
    string ad_id
    string ad_name
    number spend
    number leads
    number cpl
    string status
  }

  NOTIFICATIONS {
    string id
    string client_id
    string channel
    string type
    string status
    datetime sent_at
  }

  AUDIT_LOGS {
    string id
    string user_id
    string client_id
    string action
    string status
    datetime created_at
  }

  EXECUTIONS {
    string id
    string scope
    string status
    datetime started_at
    datetime finished_at
  }

  EXECUTION_CLIENT_RESULTS {
    string execution_id
    string client_id
    string status
    string error
  }
```

---

## 15. Decisões Arquiteturais

### DA-001 — Separar grupo de cliente e papel de usuário

Grupo do cliente define pacote/módulos. Papel do usuário define permissões.

### DA-002 — Ação real exige módulo + permissão + escopo

Nenhuma ação deve ser executada apenas porque o endpoint foi chamado.

### DA-003 — Começar com JSON e evoluir para banco

A configuração inicial pode usar arquivos JSON para velocidade. Quando o painel crescer, migrar para banco relacional.

### DA-004 — Processar em lote

O sistema deve limitar concorrência para evitar rate limit da Meta Ads API e Google Sheets API.

### DA-005 — Dry-run obrigatório para ações sensíveis

Toda ação avançada deve ser testável em dry-run antes da execução real.

---

## 16. Arquitetura de Segurança

```mermaid
flowchart TD
  Request[Requisição] --> Auth[Autenticar usuário]
  Auth --> Active{Usuário ativo?}
  Active -- Não --> Deny[Negar]
  Active -- Sim --> Scope[Verificar escopo]
  Scope --> ScopeOk{Usuário acessa cliente?}
  ScopeOk -- Não --> Deny
  ScopeOk -- Sim --> Module[Verificar módulo do cliente]
  Module --> ModuleOk{Módulo habilitado?}
  ModuleOk -- Não --> Deny
  ModuleOk -- Sim --> Permission[Verificar permissão do usuário]
  Permission --> PermissionOk{Permissão habilitada?}
  PermissionOk -- Não --> Deny
  PermissionOk -- Sim --> Execute[Executar ação]
  Execute --> Audit[Registrar auditoria]
```

---

## 17. Fluxo de Dados Meta Ads para Planilha

```mermaid
flowchart LR
  Client[Cliente Configurado] --> Account[Ad Account act_...]
  Account --> MetaInsights[Meta Ads Insights]
  MetaInsights --> CampaignLevel[Level campaign]
  MetaInsights --> AdsetLevel[Level adset]
  MetaInsights --> AdLevel[Level ad]

  CampaignLevel --> Normalize[Normalização]
  AdsetLevel --> Normalize
  AdLevel --> Normalize

  Normalize --> Analyze[Análise/Regras]
  Analyze --> Sheets[Google Sheets]
  Analyze --> Alerts[Alertas]
  Alerts --> WhatsApp[WhatsApp API]
  Sheets --> Logs[Logs de execução]
  WhatsApp --> Logs
```

---

## 18. Critérios Arquiteturais de Aceite

A arquitetura será considerada implementada quando:

- clientes puderem ser carregados por grupo/região/segmento;
- módulos forem avaliados por cliente;
- permissões forem avaliadas por usuário;
- Meta Ads for usado como fonte de campanhas/conjuntos/criativos;
- planilhas forem preenchidas automaticamente;
- WhatsApp API enviar mensagens;
- ações avançadas forem protegidas por autorização;
- logs e auditoria forem registrados;
- processamento em lote suportar alto volume de clientes.
