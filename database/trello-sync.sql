-- =====================================================================
-- DL Operational System - Trello sync columns
--
-- Execute uma vez no Supabase antes de usar "Atualizar do Trello" se o banco
-- ja foi criado antes das colunas external_id existirem no schema principal.
-- =====================================================================

alter table boards add column if not exists external_id text;
alter table board_columns add column if not exists external_id text;
alter table board_cards add column if not exists external_id text;

create unique index if not exists boards_external_id_idx on boards (external_id)
  where external_id is not null;

create unique index if not exists board_columns_external_id_idx on board_columns (external_id)
  where external_id is not null;

create unique index if not exists board_cards_external_id_idx on board_cards (external_id)
  where external_id is not null;
