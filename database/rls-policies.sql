-- =====================================================================
-- DL Operational System — Políticas RLS (Row Level Security) previstas
-- Fase 2/3. NÃO executado no MVP. Estrutura inicial de segurança.
--
-- Princípio: isolamento por workspace. Um usuário só enxerga dados dos
-- workspaces em que é membro (workspace_members). Esta é a base; papéis
-- (owner/admin/gestor/operador) refinam permissões de escrita na Fase 6.
-- =====================================================================

-- Função auxiliar: o usuário atual é membro do workspace?
create or replace function is_workspace_member(ws uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from workspace_members m
    where m.workspace_id = ws
      and m.profile_id = auth.uid()
  );
$$;

-- Habilita RLS em todas as tabelas de domínio.
alter table workspaces            enable row level security;
alter table profiles              enable row level security;
alter table workspace_members     enable row level security;
alter table clients               enable row level security;
alter table boards                enable row level security;
alter table board_columns         enable row level security;
alter table board_cards           enable row level security;
alter table tasks                 enable row level security;
alter table campaigns             enable row level security;
alter table calendar_events       enable row level security;
alter table briefings             enable row level security;
alter table briefing_items        enable row level security;
alter table drive_files           enable row level security;
alter table documents             enable row level security;
alter table sheets                enable row level security;
alter table whatsapp_conversations enable row level security;
alter table whatsapp_messages     enable row level security;
alter table chat_conversations    enable row level security;
alter table chat_messages         enable row level security;
alter table activity_logs         enable row level security;

-- Profiles: cada usuário lê/edita o próprio perfil.
create policy "profiles_self_select" on profiles
  for select using (id = auth.uid());
create policy "profiles_self_update" on profiles
  for update using (id = auth.uid());

-- Workspaces: membros enxergam seus workspaces.
create policy "workspaces_member_select" on workspaces
  for select using (is_workspace_member(id));

-- workspace_members: o usuário vê as associações dos seus workspaces.
create policy "members_select" on workspace_members
  for select using (is_workspace_member(workspace_id));

-- Macro para tabelas com workspace_id: acesso total a membros.
-- (No Supabase, repetimos a policy por tabela — abaixo o padrão para clients;
--  replicar o mesmo bloco para as demais tabelas com workspace_id.)
create policy "clients_member_all" on clients
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "boards_member_all" on boards
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "tasks_member_all" on tasks
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "campaigns_member_all" on campaigns
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "calendar_events_member_all" on calendar_events
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "briefings_member_all" on briefings
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "drive_files_member_all" on drive_files
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "documents_member_all" on documents
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "sheets_member_all" on sheets
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "wa_conversations_member_all" on whatsapp_conversations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "chat_conversations_member_all" on chat_conversations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "activity_logs_member_select" on activity_logs
  for select using (is_workspace_member(workspace_id));

-- Tabelas-filhas sem workspace_id direto herdam o acesso pelo pai.
-- Exemplo (board_columns -> boards). Replicar padrão para board_cards,
-- briefing_items, whatsapp_messages, chat_messages.
create policy "board_columns_via_board" on board_columns
  for all using (
    exists (select 1 from boards b
            where b.id = board_columns.board_id
              and is_workspace_member(b.workspace_id))
  );

create policy "board_cards_via_board" on board_cards
  for all using (
    exists (select 1 from boards b
            where b.id = board_cards.board_id
              and is_workspace_member(b.workspace_id))
  );

create policy "briefing_items_via_briefing" on briefing_items
  for all using (
    exists (select 1 from briefings br
            where br.id = briefing_items.briefing_id
              and is_workspace_member(br.workspace_id))
  );

create policy "whatsapp_messages_via_conversation" on whatsapp_messages
  for all using (
    exists (select 1 from whatsapp_conversations c
            where c.id = whatsapp_messages.conversation_id
              and is_workspace_member(c.workspace_id))
  );

create policy "chat_messages_via_conversation" on chat_messages
  for all using (
    exists (select 1 from chat_conversations c
            where c.id = chat_messages.conversation_id
              and is_workspace_member(c.workspace_id))
  );

-- NOTA (Fase 6): refinar escrita por papel. Ex.: apenas owner/admin podem
-- remover clientes; operador edita apenas seus próprios cards/tarefas.
