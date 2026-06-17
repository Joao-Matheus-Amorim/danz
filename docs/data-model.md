# Modelo de Dados - DL Operational System

Espelha `lib/types.ts` e `database/schema.sql`.

## Entidades Principais
- **Workspace**: tenant da operacao e raiz do isolamento.
- **Profile**: usuario vinculado ao `auth.users` do Supabase.
- **WorkspaceMember**: associacao Profile/Workspace com papel.
- **Client**: cliente da carteira, com status, plano e tags de saude.
- **Board / BoardColumn / BoardCard**: quadros estilo Trello.
- **Task**: tarefa atribuida a um Profile e opcionalmente a um Client.
- **Campaign**: dados de campanha Meta Ads por Client.
- **CalendarEvent**: evento por tipo.
- **Briefing / BriefingItem**: controle mensal por Client.
- **DriveFile / DocumentItem / SheetItem**: metadados de arquivos Google.
- **WhatsAppConversation / WhatsAppMessage**: inbox.
- **ChatConversation / ChatMessage**: historico do Dogtooth.
- **ActivityLog**: auditoria.

## Relacionamentos
```text
Workspace 1-* WorkspaceMember *-1 Profile
Workspace 1-* Client
Workspace 1-* Board 1-* BoardColumn 1-* BoardCard *-0..1 Profile
Workspace 1-* Task *-0..1 Profile / *-0..1 Client
Workspace 1-* Campaign *-0..1 Client
Workspace 1-* CalendarEvent *-0..1 Profile / *-0..1 Client
Workspace 1-* Briefing 1-* BriefingItem *-0..1 Client
Workspace 1-* DriveFile | DocumentItem | SheetItem
Workspace 1-* WhatsAppConversation 1-* WhatsAppMessage
Workspace 1-* ChatConversation 1-* ChatMessage
Workspace 1-* ActivityLog
```

## Banco
- Toda tabela de dominio carrega `workspace_id` quando pertence ao tenant.
- `created_at` e `updated_at` sao usados para rastrear alteracoes.
- Enums no banco espelham unions do TypeScript.
- Valores monetarios usam `bigint` de centavos.
- `external_id` guarda ids de sistemas externos:
  - `boards`, `board_columns`, `board_cards`: Trello.
  - `drive_files`, `documents`, `sheets`: Google.

## Estado de Persistencia
- **Real via Supabase:** Auth, profiles/workspaces/members, clientes, boards,
  colunas, cards, calendario, briefing mensal, campanhas e tarefas do Meu
  Painel. O Dashboard e o Meu Painel consolidam essas superficies reais em seus
  KPIs e widgets.
- **Escopo multi-tenant:** RLS segue como barreira de seguranca e os
  repositorios reais tambem filtram pelo workspace resolvido para evitar mistura
  de dados entre workspaces do mesmo usuario.
- **Mock/fallback por enquanto:** arquivos, inbox, Dogtooth,
  formularios publicos de briefing e superficies fora dos cortes atuais.
- **Trello:** importacao nao destrutiva e envio controlado de cards, usando os
  campos `external_id`.

## Evolucao
- **client_contacts**: multiplos contatos por cliente.
- **task_comments / card_comments**: colaboracao.
- **checklist_items**: checklist real dos cards.
- **integrations_credentials**: tokens por workspace via cofre/secret manager.
- **automation_runs / job_runs**: historico de execucoes.
- **notifications**: central de notificacoes real.
