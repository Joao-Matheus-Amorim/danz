# Roadmap — DL Operational System

## Fase 1 — MVP visual navegável  ✅ (entregue)
Frontend SaaS completo, navegável, fiel à identidade, com dados mockados
centralizados, tipos, rotas e estrutura pronta para banco e IA. Docs PMBOK e
registro de dívidas técnicas.

## Fase 2 — Supabase
- Criar projeto Supabase; configurar env (`NEXT_PUBLIC_SUPABASE_*`).
- Aplicar `database/schema.sql` e `database/rls-policies.sql`.
- Implementar Supabase Auth (substituir login simbólico).
- Seed inicial a partir do mock-data.

## Fase 3 — CRUD real
- Camada `lib/repositories/*` com as assinaturas dos helpers do mock-data.
- Substituir leituras/escritas mock por banco (clientes, boards, tarefas,
  calendário, briefings, campanhas, arquivos, inbox).
- Persistir DnD dos boards, criação de cliente/evento/tarefa.

## Fase 4 — IA DLtinho
- Rota server-side `app/api/dltinho` usando `OPENAI_API_KEY`.
- Implementar `askDLtinho` real e execução das `DLTINHO_ACTIONS`
  (criar cliente/tarefa, gerar copy, resumir cliente, métricas, relatório).
- Persistir conversas (`chat_conversations` / `chat_messages`).

## Fase 5 — Integrações + ponte com `danz`
- Google Drive/Docs/Sheets (OAuth + embed/edição).
- WhatsApp via provedor homologado (Evolution API / Z-API / Baileys).
- Meta Ads (reusar lógica do motor `danz`).
- Trello (sincronizar boards).
- Consumir APIs internas do `danz` (alertas, histórico, jobs, planilhas).

## Fase 6 — Permissões e multiusuário
- RBAC por papel (owner/admin/gestor/operador) refinando as RLS.
- Convites de usuário, gestão de membros, auditoria ativa (`activity_logs`).
- Notificações reais e busca global.
