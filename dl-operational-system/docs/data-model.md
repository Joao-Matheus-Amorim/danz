# Modelo de Dados — DL Operational System

Espelha `lib/types.ts` (Fase 1) e `database/schema.sql` (Fase 2/3).

## Entidades principais
- **Workspace** — tenant da operação. Raiz do isolamento.
- **Profile** — usuário (vinculado ao `auth.users` do Supabase).
- **WorkspaceMember** — associação Profile↔Workspace com papel.
- **Client** — cliente da carteira (status, plano, tags de saúde).
- **Board / BoardColumn / BoardCard** — quadros estilo Trello.
- **Task** — tarefa atribuída a um Profile (e opcionalmente a um Client).
- **Campaign** — dados de campanha Meta Ads por Client.
- **CalendarEvent** — evento por tipo (reunião/tarefa/conteúdo/campanha).
- **Briefing / BriefingItem** — controle mensal por Client.
- **DriveFile / DocumentItem / SheetItem** — metadados de arquivos Google.
- **WhatsAppConversation / WhatsAppMessage** — inbox.
- **ChatConversation / ChatMessage** — histórico do DLtinho.
- **ActivityLog** — auditoria.

## Relacionamentos (resumo)
```
Workspace 1—* WorkspaceMember *—1 Profile
Workspace 1—* Client
Workspace 1—* Board 1—* BoardColumn 1—* BoardCard *—1 Profile (assignee)
Workspace 1—* Task *—1 Profile / *—0..1 Client
Workspace 1—* Campaign *—1 Client
Workspace 1—* CalendarEvent *—0..1 Profile / *—0..1 Client
Workspace 1—* Briefing 1—* BriefingItem *—0..1 Client
Workspace 1—* DriveFile | DocumentItem | SheetItem
Workspace 1—* WhatsAppConversation 1—* WhatsAppMessage
Workspace 1—* ChatConversation 1—* ChatMessage
Workspace 1—* ActivityLog
```

## Estrutura prevista para o banco
- Toda tabela de domínio carrega `workspace_id` (multi-tenant + RLS).
- `created_at` / `updated_at` em todas as tabelas.
- Enums no banco espelham as unions do TypeScript (status, tags, prioridades…).
- Valores monetários em `bigint` de **centavos**.
- Tabelas de arquivos guardam `external_id` (id no Google) para integração futura.

## Tabelas futuras / evolução
- **client_contacts** — múltiplos contatos por cliente.
- **task_comments / card_comments** — colaboração.
- **checklist_items** — checklist real dos cards (hoje agregado em total/done).
- **integrations_credentials** — tokens por workspace (cofre/secret manager).
- **automations / jobs_runs** — ponte com o motor `danz` (histórico de execuções).
- **notifications** — central de notificações real.
