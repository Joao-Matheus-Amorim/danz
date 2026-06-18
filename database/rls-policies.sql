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

-- Owner/admin/gestor podem criar e editar dados de dominio; operador so le.
-- Exclusao continua restrita a is_workspace_admin (owner/admin).
create or replace function is_workspace_editor(ws uuid)
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
      and m.role in ('owner', 'admin', 'gestor')
  );
$$;

-- Quem pode liberar/revogar documento para admin: owner ou gestor.
-- Admin nao entra aqui mesmo sendo "editor" em outros dominios, senao um
-- admin que ja recebeu liberacao poderia liberar o documento para outros
-- admins (fan-out indevido da liberacao).
create or replace function is_workspace_manager(ws uuid)
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
      and m.role in ('owner', 'gestor')
  );
$$;

-- Editor (owner/admin/gestor) ve todo board do workspace. Operador so ve um
-- board se foi explicitamente atribuido via board_assignees.
create or replace function can_view_board(p_board_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from boards b
    join workspace_members m
      on m.workspace_id = b.workspace_id
      and m.profile_id = auth.uid()
    where b.id = p_board_id
      and (
        m.role in ('owner', 'admin', 'gestor')
        or exists (
          select 1 from board_assignees ba
          where ba.board_id = b.id and ba.profile_id = auth.uid()
        )
      )
  );
$$;

-- Owner ve todo documento. Gestor/operador veem todo documento (igual hoje).
-- Admin so ve um documento se um gestor/owner liberar via document_admin_releases.
create or replace function can_view_document(p_document_id uuid, ws uuid)
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
      and (
        m.role in ('owner', 'gestor', 'operador')
        or exists (
          select 1 from document_admin_releases dar
          where dar.document_id = p_document_id and dar.profile_id = auth.uid()
        )
      )
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
alter table board_assignees enable row level security;
alter table document_admin_releases enable row level security;
alter table sheets enable row level security;
alter table ad_accounts enable row level security;
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
drop policy if exists "members_admin_update" on workspace_members;
drop policy if exists "members_admin_delete" on workspace_members;
drop policy if exists "clients_member_all" on clients;
drop policy if exists "clients_select" on clients;
drop policy if exists "clients_editor_insert" on clients;
drop policy if exists "clients_editor_update" on clients;
drop policy if exists "clients_admin_delete" on clients;
drop policy if exists "boards_member_all" on boards;
drop policy if exists "boards_select" on boards;
drop policy if exists "boards_editor_insert" on boards;
drop policy if exists "boards_editor_update" on boards;
drop policy if exists "boards_admin_delete" on boards;
drop policy if exists "board_assignees_select" on board_assignees;
drop policy if exists "board_assignees_editor_insert" on board_assignees;
drop policy if exists "board_assignees_editor_delete" on board_assignees;
drop policy if exists "documents_member_all" on documents;
drop policy if exists "documents_select" on documents;
drop policy if exists "documents_member_insert" on documents;
drop policy if exists "documents_member_update" on documents;
drop policy if exists "documents_member_delete" on documents;
drop policy if exists "document_admin_releases_select" on document_admin_releases;
drop policy if exists "document_admin_releases_editor_insert" on document_admin_releases;
drop policy if exists "document_admin_releases_editor_delete" on document_admin_releases;
drop policy if exists "tasks_member_all" on tasks;
drop policy if exists "tasks_select" on tasks;
drop policy if exists "tasks_editor_insert" on tasks;
drop policy if exists "tasks_editor_update" on tasks;
drop policy if exists "tasks_admin_delete" on tasks;
drop policy if exists "campaigns_member_all" on campaigns;
drop policy if exists "campaigns_select" on campaigns;
drop policy if exists "campaigns_editor_insert" on campaigns;
drop policy if exists "campaigns_editor_update" on campaigns;
drop policy if exists "campaigns_admin_delete" on campaigns;
drop policy if exists "calendar_events_member_all" on calendar_events;
drop policy if exists "calendar_events_select" on calendar_events;
drop policy if exists "calendar_events_editor_insert" on calendar_events;
drop policy if exists "calendar_events_editor_update" on calendar_events;
drop policy if exists "calendar_events_admin_delete" on calendar_events;
drop policy if exists "briefings_member_all" on briefings;
drop policy if exists "briefings_select" on briefings;
drop policy if exists "briefings_editor_insert" on briefings;
drop policy if exists "briefings_editor_update" on briefings;
drop policy if exists "briefings_admin_delete" on briefings;
drop policy if exists "drive_files_member_all" on drive_files;
drop policy if exists "documents_member_all" on documents;
drop policy if exists "sheets_member_all" on sheets;
drop policy if exists "sheets_select" on sheets;
drop policy if exists "sheets_admin_insert" on sheets;
drop policy if exists "sheets_admin_update" on sheets;
drop policy if exists "sheets_admin_delete" on sheets;
drop policy if exists "ad_accounts_select" on ad_accounts;
drop policy if exists "ad_accounts_admin_delete" on ad_accounts;
drop policy if exists "wa_conversations_member_all" on whatsapp_conversations;
drop policy if exists "chat_conversations_member_all" on chat_conversations;
drop policy if exists "activity_logs_member_select" on activity_logs;
drop policy if exists "board_columns_via_board" on board_columns;
drop policy if exists "board_columns_select" on board_columns;
drop policy if exists "board_columns_editor_insert" on board_columns;
drop policy if exists "board_columns_editor_update" on board_columns;
drop policy if exists "board_columns_admin_delete" on board_columns;
drop policy if exists "board_cards_via_board" on board_cards;
drop policy if exists "board_cards_select" on board_cards;
drop policy if exists "board_cards_editor_insert" on board_cards;
drop policy if exists "board_cards_editor_update" on board_cards;
drop policy if exists "board_cards_admin_delete" on board_cards;
drop policy if exists "briefing_items_via_briefing" on briefing_items;
drop policy if exists "briefing_items_select" on briefing_items;
drop policy if exists "briefing_items_editor_insert" on briefing_items;
drop policy if exists "briefing_items_editor_update" on briefing_items;
drop policy if exists "briefing_items_admin_delete" on briefing_items;
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

create policy "members_admin_update" on workspace_members
  for update using (is_workspace_admin(workspace_id))
  with check (is_workspace_admin(workspace_id) and role <> 'owner');

create policy "members_admin_delete" on workspace_members
  for delete using (is_workspace_admin(workspace_id));

create policy "clients_select" on clients
  for select using (is_workspace_member(workspace_id));
create policy "clients_editor_insert" on clients
  for insert with check (is_workspace_editor(workspace_id));
create policy "clients_editor_update" on clients
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "clients_admin_delete" on clients
  for delete using (is_workspace_admin(workspace_id));

create policy "boards_select" on boards
  for select using (can_view_board(id));
create policy "boards_editor_insert" on boards
  for insert with check (is_workspace_editor(workspace_id));
create policy "boards_editor_update" on boards
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "boards_admin_delete" on boards
  for delete using (is_workspace_admin(workspace_id));

create policy "board_assignees_select" on board_assignees
  for select using (
    exists (
      select 1 from boards b
      where b.id = board_assignees.board_id and is_workspace_member(b.workspace_id)
    )
  );
create policy "board_assignees_editor_insert" on board_assignees
  for insert with check (
    exists (
      select 1 from boards b
      where b.id = board_assignees.board_id and is_workspace_editor(b.workspace_id)
    )
  );
create policy "board_assignees_editor_delete" on board_assignees
  for delete using (
    exists (
      select 1 from boards b
      where b.id = board_assignees.board_id and is_workspace_editor(b.workspace_id)
    )
  );

create policy "tasks_select" on tasks
  for select using (is_workspace_member(workspace_id));
create policy "tasks_editor_insert" on tasks
  for insert with check (is_workspace_editor(workspace_id));
create policy "tasks_editor_update" on tasks
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "tasks_admin_delete" on tasks
  for delete using (is_workspace_admin(workspace_id));

create policy "campaigns_select" on campaigns
  for select using (is_workspace_member(workspace_id));
create policy "campaigns_editor_insert" on campaigns
  for insert with check (is_workspace_editor(workspace_id));
create policy "campaigns_editor_update" on campaigns
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "campaigns_admin_delete" on campaigns
  for delete using (is_workspace_admin(workspace_id));

create policy "calendar_events_select" on calendar_events
  for select using (is_workspace_member(workspace_id));
create policy "calendar_events_editor_insert" on calendar_events
  for insert with check (is_workspace_editor(workspace_id));
create policy "calendar_events_editor_update" on calendar_events
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "calendar_events_admin_delete" on calendar_events
  for delete using (is_workspace_admin(workspace_id));

create policy "briefings_select" on briefings
  for select using (is_workspace_member(workspace_id));
create policy "briefings_editor_insert" on briefings
  for insert with check (is_workspace_editor(workspace_id));
create policy "briefings_editor_update" on briefings
  for update using (is_workspace_editor(workspace_id))
  with check (is_workspace_editor(workspace_id));
create policy "briefings_admin_delete" on briefings
  for delete using (is_workspace_admin(workspace_id));

create policy "drive_files_member_all" on drive_files
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "documents_select" on documents
  for select using (can_view_document(id, workspace_id));
create policy "documents_member_insert" on documents
  for insert with check (is_workspace_member(workspace_id));
create policy "documents_member_update" on documents
  for update using (can_view_document(id, workspace_id))
  with check (can_view_document(id, workspace_id));
create policy "documents_member_delete" on documents
  for delete using (can_view_document(id, workspace_id));

create policy "document_admin_releases_select" on document_admin_releases
  for select using (
    exists (
      select 1 from documents d
      where d.id = document_admin_releases.document_id and is_workspace_member(d.workspace_id)
    )
  );
create policy "document_admin_releases_editor_insert" on document_admin_releases
  for insert with check (
    exists (
      select 1 from documents d
      where d.id = document_admin_releases.document_id and is_workspace_manager(d.workspace_id)
    )
  );
create policy "document_admin_releases_editor_delete" on document_admin_releases
  for delete using (
    exists (
      select 1 from documents d
      where d.id = document_admin_releases.document_id and is_workspace_manager(d.workspace_id)
    )
  );

-- sheets nao tem insert/update via RLS de cliente: external_id e title sao
-- gravados exclusivamente por app/api/sheets/create usando a service role
-- (que ignora RLS), depois que o proprio servidor cria a planilha no Google.
-- Isso impede qualquer membro/admin de "plantar" um external_id de planilha
-- de outro workspace para passar pela checagem de ownership do export.
create policy "sheets_select" on sheets
  for select using (is_workspace_member(workspace_id));
create policy "sheets_admin_delete" on sheets
  for delete using (is_workspace_admin(workspace_id));

-- ad_accounts segue o mesmo padrao: external_id (ad account id do Meta) so e
-- gravado por app/api/meta/ad-accounts/link via service role, depois de
-- validar a conta na Graph API com o META_ACCESS_TOKEN do servidor. Sem isso,
-- qualquer membro poderia vincular ao seu workspace o ID de uma conta de
-- anuncio de outro tenant e ler saldo/insights dela em app/api/meta/insights.
create policy "ad_accounts_select" on ad_accounts
  for select using (is_workspace_member(workspace_id));
create policy "ad_accounts_admin_delete" on ad_accounts
  for delete using (is_workspace_admin(workspace_id));

create policy "wa_conversations_member_all" on whatsapp_conversations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "chat_conversations_member_all" on chat_conversations
  for all using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "activity_logs_member_select" on activity_logs
  for select using (is_workspace_member(workspace_id));

create policy "board_columns_select" on board_columns
  for select using (can_view_board(board_id));
create policy "board_columns_editor_insert" on board_columns
  for insert with check (
    exists (
      select 1 from boards b
      where b.id = board_columns.board_id and is_workspace_editor(b.workspace_id)
    )
  );
create policy "board_columns_editor_update" on board_columns
  for update using (
    exists (
      select 1 from boards b
      where b.id = board_columns.board_id and is_workspace_editor(b.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from boards b
      where b.id = board_columns.board_id and is_workspace_editor(b.workspace_id)
    )
  );
create policy "board_columns_admin_delete" on board_columns
  for delete using (
    exists (
      select 1 from boards b
      where b.id = board_columns.board_id and is_workspace_admin(b.workspace_id)
    )
  );

create policy "board_cards_select" on board_cards
  for select using (can_view_board(board_id));
create policy "board_cards_editor_insert" on board_cards
  for insert with check (
    exists (
      select 1 from boards b
      where b.id = board_cards.board_id and is_workspace_editor(b.workspace_id)
    )
  );
create policy "board_cards_editor_update" on board_cards
  for update using (
    exists (
      select 1 from boards b
      where b.id = board_cards.board_id and is_workspace_editor(b.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from boards b
      where b.id = board_cards.board_id and is_workspace_editor(b.workspace_id)
    )
  );
create policy "board_cards_admin_delete" on board_cards
  for delete using (
    exists (
      select 1 from boards b
      where b.id = board_cards.board_id and is_workspace_admin(b.workspace_id)
    )
  );

create policy "briefing_items_select" on briefing_items
  for select using (
    exists (
      select 1 from briefings br
      where br.id = briefing_items.briefing_id and is_workspace_member(br.workspace_id)
    )
  );
create policy "briefing_items_editor_insert" on briefing_items
  for insert with check (
    exists (
      select 1 from briefings br
      where br.id = briefing_items.briefing_id and is_workspace_editor(br.workspace_id)
    )
  );
create policy "briefing_items_editor_update" on briefing_items
  for update using (
    exists (
      select 1 from briefings br
      where br.id = briefing_items.briefing_id and is_workspace_editor(br.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from briefings br
      where br.id = briefing_items.briefing_id and is_workspace_editor(br.workspace_id)
    )
  );
create policy "briefing_items_admin_delete" on briefing_items
  for delete using (
    exists (
      select 1 from briefings br
      where br.id = briefing_items.briefing_id and is_workspace_admin(br.workspace_id)
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

-- ----------------------------------------------------------------------
-- Formulario publico de briefing (acesso anonimo via funcoes)
--
-- O cliente preenche o briefing sem login. Em vez de abrir politicas de tabela
-- para o papel `anon` (o que arriscaria expor outras linhas), expomos apenas
-- duas funcoes security definer que operam exatamente na linha do token:
--   - public_briefing_form(token): retorna so os campos seguros do formulario.
--   - submit_briefing_response(token, payload): grava a resposta uma unica vez.
-- ----------------------------------------------------------------------
create or replace function public_briefing_form(p_token uuid)
returns table (
  client_name text,
  month_ref text,
  submitted boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select bi.client_name,
         b.month_ref,
         (bi.submitted_at is not null) as submitted
  from briefing_items bi
  join briefings b on b.id = bi.briefing_id
  where bi.public_token = p_token;
$$;

create or replace function submit_briefing_response(p_token uuid, p_response jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from briefing_items
  where public_token = p_token
    and submitted_at is null;

  if v_id is null then
    return false;
  end if;

  update briefing_items
  set response = p_response,
      submitted_at = now(),
      done = true
  where id = v_id;

  return true;
end;
$$;

revoke all on function public_briefing_form(uuid) from public;
revoke all on function submit_briefing_response(uuid, jsonb) from public;
grant execute on function public_briefing_form(uuid) to anon, authenticated;
grant execute on function submit_briefing_response(uuid, jsonb) to anon, authenticated;
