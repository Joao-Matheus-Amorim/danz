-- =====================================================================
-- DL Operational System - Schema Supabase / PostgreSQL
-- Fase 2/3 do roadmap.
--
-- Este arquivo pode ser reexecutado em um projeto Supabase novo ou
-- parcialmente criado. Ele nao remove dados existentes.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------
do $$
begin
  create type profile_role as enum ('owner', 'admin', 'gestor', 'operador');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type client_status as enum ('ativo', 'pausado');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type client_tag as enum ('em-dia', 'atencao', 'critico');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type task_status as enum ('todo', 'doing', 'done');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type task_priority as enum ('baixa', 'media', 'alta');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type campaign_status as enum ('ativa', 'pausada', 'encerrada');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type calendar_event_type as enum ('reuniao', 'tarefa', 'conteudo', 'campanha');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type wa_direction as enum ('in', 'out');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type chat_role as enum ('user', 'assistant', 'system');
exception when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------
-- Nucleo: workspaces, profiles, membros
-- ----------------------------------------------------------------------
create table if not exists workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null default 'Trafego',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  initials    text not null,
  email       text not null unique,
  job_title   text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists workspace_members (
  workspace_id uuid not null references workspaces (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  role         profile_role not null default 'operador',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, profile_id)
);

-- ----------------------------------------------------------------------
-- Clientes
-- ----------------------------------------------------------------------
create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  name          text not null,
  bandeira      text not null default '',
  plan          text not null default 'Essencial',
  status        client_status not null default 'ativo',
  start_date    date not null default current_date,
  tags          client_tag[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists clients_workspace_id_idx on clients (workspace_id);
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'clients'
      and table_schema = 'public'
      and column_name = 'bandeira'
  ) then
    if exists (
      select 1
      from information_schema.columns
      where table_name = 'clients'
        and table_schema = 'public'
        and column_name = 'niche'
    ) then
      update clients
      set bandeira = coalesce(
        nullif(trim(bandeira), ''),
        nullif(trim(niche), '')
      )
      where (bandeira is null or trim(bandeira) = '')
        and niche is not null
        and trim(niche) <> '';
    end if;
  else
    if exists (
      select 1
      from information_schema.columns
      where table_name = 'clients'
        and table_schema = 'public'
        and column_name = 'niche'
    ) then
      alter table clients rename column niche to bandeira;
    else
      alter table clients add column bandeira text not null default '';
    end if;
  end if;
end $$;

-- ----------------------------------------------------------------------
-- Boards
-- ----------------------------------------------------------------------
create table if not exists boards (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null,
  gradient      text not null default '',
  external_id   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists boards_workspace_id_idx on boards (workspace_id);
drop index if exists boards_external_id_idx;
create unique index if not exists boards_workspace_external_id_idx
  on boards (workspace_id, external_id)
  where external_id is not null;

create table if not exists board_columns (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references boards (id) on delete cascade,
  title       text not null,
  position    int not null default 0,
  external_id text,
  created_at  timestamptz not null default now(),
  unique (id, board_id)
);
create index if not exists board_columns_board_id_idx on board_columns (board_id);
drop index if exists board_columns_external_id_idx;
create unique index if not exists board_columns_board_external_id_idx
  on board_columns (board_id, external_id)
  where external_id is not null;

create table if not exists board_cards (
  id              uuid primary key default gen_random_uuid(),
  board_id        uuid not null references boards (id) on delete cascade,
  column_id       uuid not null,
  title           text not null,
  description     text,
  labels          text[] not null default '{}',
  assignee_id     uuid references profiles (id) on delete set null,
  checklist_total int not null default 0,
  checklist_done  int not null default 0,
  due_date        date,
  position        int not null default 0,
  external_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (column_id, board_id)
    references board_columns (id, board_id) on delete cascade
);
create index if not exists board_cards_column_id_idx on board_cards (column_id);
drop index if exists board_cards_external_id_idx;
create unique index if not exists board_cards_board_external_id_idx
  on board_cards (board_id, external_id)
  where external_id is not null;

-- ----------------------------------------------------------------------
-- Tarefas
-- ----------------------------------------------------------------------
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null,
  status        task_status not null default 'todo',
  priority      task_priority not null default 'media',
  assignee_id   uuid references profiles (id) on delete set null,
  client_id     uuid references clients (id) on delete set null,
  due_date      date,
  done          boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tasks_workspace_id_idx on tasks (workspace_id);

-- ----------------------------------------------------------------------
-- Campanhas
-- ----------------------------------------------------------------------
create table if not exists campaigns (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces (id) on delete cascade,
  client_id      uuid references clients (id) on delete set null,
  status         campaign_status not null default 'pausada',
  spend_cents    bigint not null default 0,
  conversations  int not null default 0,
  results        int not null default 0,
  sent           int not null default 0,
  balance_cents  bigint not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists campaigns_workspace_id_idx on campaigns (workspace_id);

-- ----------------------------------------------------------------------
-- Calendario
-- ----------------------------------------------------------------------
create table if not exists calendar_events (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null,
  type          calendar_event_type not null default 'tarefa',
  event_date    date not null,
  event_time    time,
  owner_id      uuid references profiles (id) on delete set null,
  client_id     uuid references clients (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists calendar_events_workspace_id_event_date_idx
  on calendar_events (workspace_id, event_date);

-- ----------------------------------------------------------------------
-- Briefings
-- ----------------------------------------------------------------------
create table if not exists briefings (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  month_ref     text not null,
  created_at    timestamptz not null default now()
);
create unique index if not exists briefings_workspace_month_ref_idx
  on briefings (workspace_id, month_ref);

create table if not exists briefing_items (
  id            uuid primary key default gen_random_uuid(),
  briefing_id   uuid not null references briefings (id) on delete cascade,
  client_id     uuid references clients (id) on delete set null,
  client_name   text not null,
  done          boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists briefing_items_briefing_id_idx on briefing_items (briefing_id);

-- Formulario publico de briefing: cada item ganha um token opaco para o link
-- que o cliente preenche sem login, alem da resposta (campos fixos em jsonb) e
-- o carimbo de submissao. O default volatil garante token distinto por linha
-- existente ao adicionar a coluna.
alter table briefing_items add column if not exists public_token uuid not null default gen_random_uuid();
alter table briefing_items add column if not exists response jsonb;
alter table briefing_items add column if not exists submitted_at timestamptz;
create unique index if not exists briefing_items_public_token_idx on briefing_items (public_token);

-- ----------------------------------------------------------------------
-- Arquivos
-- ----------------------------------------------------------------------
create table if not exists drive_files (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  name          text not null,
  kind          text not null default 'file',
  file_type     text not null default '',
  owner_name    text not null default '',
  source        text not null default 'meu-drive',
  starred       boolean not null default false,
  trashed       boolean not null default false,
  external_id   text,
  modified_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
alter table drive_files add column if not exists starred boolean not null default false;
alter table drive_files add column if not exists trashed boolean not null default false;
create index if not exists drive_files_workspace_id_idx on drive_files (workspace_id);

create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null,
  owner_name    text not null default '',
  external_id   text,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists documents_workspace_id_idx on documents (workspace_id);

create table if not exists sheets (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null,
  owner_name    text not null default '',
  external_id   text,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists sheets_workspace_id_idx on sheets (workspace_id);

-- ----------------------------------------------------------------------
-- Inbox WhatsApp
-- ----------------------------------------------------------------------
create table if not exists whatsapp_conversations (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references workspaces (id) on delete cascade,
  contact_name     text not null,
  number_label     text not null default '',
  last_message     text,
  last_message_at  timestamptz,
  unread           int not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists whatsapp_conversations_workspace_id_idx
  on whatsapp_conversations (workspace_id);

create table if not exists whatsapp_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references whatsapp_conversations (id) on delete cascade,
  direction        wa_direction not null,
  body             text not null,
  created_at       timestamptz not null default now()
);
create index if not exists whatsapp_messages_conversation_id_idx
  on whatsapp_messages (conversation_id);

-- ----------------------------------------------------------------------
-- Dogtooth
-- ----------------------------------------------------------------------
create table if not exists chat_conversations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  profile_id    uuid references profiles (id) on delete set null,
  title         text not null default 'Nova conversa',
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists chat_conversations_workspace_id_idx
  on chat_conversations (workspace_id);

create table if not exists chat_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references chat_conversations (id) on delete cascade,
  role             chat_role not null,
  content          text not null,
  created_at       timestamptz not null default now()
);
create index if not exists chat_messages_conversation_id_idx
  on chat_messages (conversation_id);

-- ----------------------------------------------------------------------
-- Auditoria
-- ----------------------------------------------------------------------
create table if not exists activity_logs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  actor_id      uuid references profiles (id) on delete set null,
  actor_name    text not null default '',
  action        text not null,
  target        text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists activity_logs_workspace_id_created_at_idx
  on activity_logs (workspace_id, created_at desc);
