-- =====================================================================
-- DL Operational System — Schema previsto (Supabase / PostgreSQL)
-- Fase 2/3 do roadmap. NÃO é executado no MVP (que roda em mock-data).
--
-- Convenções:
--  - Toda tabela de domínio tem workspace_id para multi-tenant + RLS.
--  - created_at/updated_at em todas as tabelas.
--  - IDs em uuid (default gen_random_uuid()).
--  - Os tipos/enum espelham lib/types.ts.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------
create type profile_role      as enum ('owner', 'admin', 'gestor', 'operador');
create type client_status     as enum ('ativo', 'pausado');
create type client_tag        as enum ('em-dia', 'atencao', 'critico');
create type task_status       as enum ('todo', 'doing', 'done');
create type task_priority     as enum ('baixa', 'media', 'alta');
create type campaign_status   as enum ('ativa', 'pausada', 'encerrada');
create type calendar_event_type as enum ('reuniao', 'tarefa', 'conteudo', 'campanha');
create type wa_direction      as enum ('in', 'out');
create type chat_role         as enum ('user', 'assistant', 'system');

-- ----------------------------------------------------------------------
-- Núcleo: workspaces, profiles, membros
-- ----------------------------------------------------------------------
create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null default 'Tráfego',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- profiles referencia auth.users (Supabase Auth) por id.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  initials    text not null,
  email       text not null unique,
  job_title   text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  role         profile_role not null default 'operador',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, profile_id)
);

-- ----------------------------------------------------------------------
-- Clientes
-- ----------------------------------------------------------------------
create table clients (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name         text not null,
  niche        text not null default '',
  plan         text not null default 'Essencial',
  status       client_status not null default 'ativo',
  start_date   date not null default current_date,
  tags         client_tag[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on clients (workspace_id);

-- ----------------------------------------------------------------------
-- Boards
-- ----------------------------------------------------------------------
create table boards (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null,
  gradient     text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on boards (workspace_id);

create table board_columns (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references boards (id) on delete cascade,
  title      text not null,
  position   int not null default 0,
  created_at timestamptz not null default now(),
  -- Alvo do FK composto de board_cards (garante coluna+board consistentes).
  unique (id, board_id)
);
create index on board_columns (board_id);

create table board_cards (
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
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- FK composto: a coluna do card DEVE pertencer ao MESMO board.
  -- Impede referência cruzada (card de um board apontando p/ coluna de outro
  -- board/workspace), que a RLS — que autoriza via board_cards.board_id —
  -- não conseguiria barrar sozinha.
  foreign key (column_id, board_id)
    references board_columns (id, board_id) on delete cascade
);
create index on board_cards (column_id);

-- ----------------------------------------------------------------------
-- Tarefas
-- ----------------------------------------------------------------------
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null,
  status       task_status not null default 'todo',
  priority     task_priority not null default 'media',
  assignee_id  uuid references profiles (id) on delete set null,
  client_id    uuid references clients (id) on delete set null,
  due_date     date,
  done         boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on tasks (workspace_id);

-- ----------------------------------------------------------------------
-- Campanhas (Meta Ads)
-- ----------------------------------------------------------------------
create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  client_id     uuid references clients (id) on delete set null,
  status        campaign_status not null default 'pausada',
  spend_cents   bigint not null default 0,
  conversations int not null default 0,
  results       int not null default 0,
  sent          int not null default 0,
  balance_cents bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on campaigns (workspace_id);

-- ----------------------------------------------------------------------
-- Calendário
-- ----------------------------------------------------------------------
create table calendar_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null,
  type         calendar_event_type not null default 'tarefa',
  event_date   date not null,
  event_time   time,
  owner_id     uuid references profiles (id) on delete set null,
  client_id    uuid references clients (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on calendar_events (workspace_id, event_date);

-- ----------------------------------------------------------------------
-- Briefings
-- ----------------------------------------------------------------------
create table briefings (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  month_ref    text not null, -- 'YYYY-MM'
  created_at   timestamptz not null default now()
);

create table briefing_items (
  id           uuid primary key default gen_random_uuid(),
  briefing_id  uuid not null references briefings (id) on delete cascade,
  client_id    uuid references clients (id) on delete set null,
  client_name  text not null,
  done         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on briefing_items (briefing_id);

-- ----------------------------------------------------------------------
-- Arquivos (Drive / Docs / Sheets) — metadados; conteúdo via Google API
-- ----------------------------------------------------------------------
create table drive_files (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name         text not null,
  kind         text not null default 'file', -- folder | file
  file_type    text not null default '',
  owner_name   text not null default '',
  source       text not null default 'meu-drive',
  external_id  text, -- id no Google Drive
  modified_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on drive_files (workspace_id);

create table documents (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null,
  owner_name   text not null default '',
  external_id  text, -- id no Google Docs
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on documents (workspace_id);

create table sheets (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null,
  owner_name   text not null default '',
  external_id  text, -- id no Google Sheets
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on sheets (workspace_id);

-- ----------------------------------------------------------------------
-- Inbox WhatsApp
-- ----------------------------------------------------------------------
create table whatsapp_conversations (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces (id) on delete cascade,
  contact_name    text not null,
  number_label    text not null default '',
  last_message    text,
  last_message_at timestamptz,
  unread          int not null default 0,
  created_at      timestamptz not null default now()
);
create index on whatsapp_conversations (workspace_id);

create table whatsapp_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references whatsapp_conversations (id) on delete cascade,
  direction       wa_direction not null,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index on whatsapp_messages (conversation_id);

-- ----------------------------------------------------------------------
-- DLtinho (IA)
-- ----------------------------------------------------------------------
create table chat_conversations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  profile_id   uuid references profiles (id) on delete set null,
  title        text not null default 'Nova conversa',
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on chat_conversations (workspace_id);

create table chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations (id) on delete cascade,
  role            chat_role not null,
  content         text not null,
  created_at      timestamptz not null default now()
);
create index on chat_messages (conversation_id);

-- ----------------------------------------------------------------------
-- Auditoria
-- ----------------------------------------------------------------------
create table activity_logs (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  actor_id     uuid references profiles (id) on delete set null,
  actor_name   text not null default '',
  action       text not null,
  target       text not null default '',
  created_at   timestamptz not null default now()
);
create index on activity_logs (workspace_id, created_at desc);
