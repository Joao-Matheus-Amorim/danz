-- =====================================================================
-- DL Operational System - RLS policies
--
-- Execute depois de database/schema.sql. Este arquivo pode ser reexecutado:
-- ele remove as policies conhecidas antes de recria-las.
-- =====================================================================

create or replace function is_workspace_member(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from workspace_members m
    where m.workspace_id = ws
      and m.profile_id = auth.uid()
  );
$$;

create or replace function is_workspace_admin(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from workspace_members m
    where m.workspace_id = ws
      and m.profile_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table workspace_members enable row level security;
alter table clients enable row level security;
alter table boards enable row level security;
alter table board_columns enable row level security;
alter table board_cards enable row level security;
alter table tasks enable row level security;
alter table campaigns enable row level security;
alter table calendar_events enable row level security;
alter table briefings enable row level security;
alter table briefing_items enable row level security;
alter table drive_files enable row level security;
alter table documents enable row level security;
alter table sheets enable row level security;
alter table whatsapp_conversations enable row level security;
alter table whatsapp_messages enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;
alter table activity_logs enable row level security;

drop policy if exists "profiles_self_select" on profiles;
drop policy if exists "profiles_self_insert" on profiles;
drop policy if exists "profiles_self_update" on profiles;
drop policy if exists "workspaces_member_select" on workspaces;
drop policy if exists "workspaces_admin_update" on workspaces;
drop policy if exists "members_select" on workspace_members;
drop policy if exists "clients_member_all" on clients;
drop policy if exists "boards_member_all" on boards;
drop policy if exists "tasks_member_all" on tasks;
drop policy if exists "campaigns_member_all" on campaigns;
drop policy if exists "calendar_events_member_all" on calendar_events;
drop policy if exists "briefings_member_all" on briefings;
drop policy if exists "drive_files_member_all" on drive_files;
drop policy if exists "documents_member_all" on documents;
drop policy if exists "sheets_member_all" on sheets;
drop policy if exists "wa_conversations_member_all" on whatsapp_conversations;
drop policy if exists "chat_conversations_member_all" on chat_conversations;
drop policy if exists "activity_logs_member_select" on activity_logs;
drop policy if exists "board_columns_via_board" on board_columns;
drop policy if exists "board_cards_via_board" on board_cards;
drop policy if exists "briefing_items_via_briefing" on briefing_items;
drop policy if exists "whatsapp_messages_via_conversation" on whatsapp_messages;
drop policy if exists "chat_messages_via_conversation" on chat_messages;

create policy "profiles_self_select" on profiles
  for select using (id = auth.uid());

create policy "profiles_self_insert" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_self_update" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "workspaces_member_select" on workspaces
  for select using (is_workspace_member(id));

create policy "workspaces_admin_update" on workspaces
  for update using (is_workspace_admin(id))
  with check (is_workspace_admin(id));

create policy "members_select" on workspace_members
  for select using (is_workspace_member(workspace_id));

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

create policy "board_columns_via_board" on board_columns
  for all using (
    exists (
      select 1
      from boards b
      where b.id = board_columns.board_id
        and is_workspace_member(b.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from boards b
      where b.id = board_columns.board_id
        and is_workspace_member(b.workspace_id)
    )
  );

create policy "board_cards_via_board" on board_cards
  for all using (
    exists (
      select 1
      from boards b
      where b.id = board_cards.board_id
        and is_workspace_member(b.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from boards b
      where b.id = board_cards.board_id
        and is_workspace_member(b.workspace_id)
    )
  );

create policy "briefing_items_via_briefing" on briefing_items
  for all using (
    exists (
      select 1
      from briefings br
      where br.id = briefing_items.briefing_id
        and is_workspace_member(br.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from briefings br
      where br.id = briefing_items.briefing_id
        and is_workspace_member(br.workspace_id)
    )
  );

create policy "whatsapp_messages_via_conversation" on whatsapp_messages
  for all using (
    exists (
      select 1
      from whatsapp_conversations c
      where c.id = whatsapp_messages.conversation_id
        and is_workspace_member(c.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from whatsapp_conversations c
      where c.id = whatsapp_messages.conversation_id
        and is_workspace_member(c.workspace_id)
    )
  );

create policy "chat_messages_via_conversation" on chat_messages
  for all using (
    exists (
      select 1
      from chat_conversations c
      where c.id = chat_messages.conversation_id
        and is_workspace_member(c.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from chat_conversations c
      where c.id = chat_messages.conversation_id
        and is_workspace_member(c.workspace_id)
    )
  );
