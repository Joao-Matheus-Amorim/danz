-- =====================================================================
-- DL Operational System - seed inicial (Fase 2)
--
-- Ordem de uso:
-- 1. Crie um usuario em Authentication > Users no Supabase.
-- 2. Troque o email abaixo pelo email desse usuario.
-- 3. Execute depois de database/schema.sql e database/rls-policies.sql.
-- =====================================================================

do $$
declare
  owner_email text := 'admin@gmail.com';
  v_owner_id uuid := '5f8a25b0-1db0-41cc-aeca-70e036be2c21';
  v_workspace_id uuid := '00000000-0000-4000-8000-000000000001';
  v_briefing_id uuid := '00000000-0000-4000-8000-000000000401';
begin
  perform 1
  from auth.users
  where id = v_owner_id
    and email = owner_email;

  if not found then
    raise exception 'Crie primeiro um usuario de Auth com id % e email %', v_owner_id, owner_email;
  end if;

  insert into workspaces (id, name, role)
  values (v_workspace_id, 'DL Solucoes Digitais', 'Trafego')
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    updated_at = now();

  insert into profiles (id, name, initials, email, job_title)
  values (v_owner_id, 'Admin', 'AD', owner_email, 'Trafego')
  on conflict (id) do update set
    name = excluded.name,
    initials = excluded.initials,
    email = excluded.email,
    job_title = excluded.job_title,
    updated_at = now();

  insert into workspace_members (workspace_id, profile_id, role)
  values (v_workspace_id, v_owner_id, 'owner')
  on conflict (workspace_id, profile_id) do update set role = excluded.role;

  insert into clients (id, workspace_id, name, niche, plan, status, start_date, tags)
  values
    ('00000000-0000-4000-8000-000000000101', v_workspace_id, 'ANDREA BOUTIQUE', 'Moda', 'Pro', 'ativo', '2025-09-01', array['em-dia']::client_tag[]),
    ('00000000-0000-4000-8000-000000000102', v_workspace_id, 'ANNA LIMA', 'Estetica', 'Essencial', 'ativo', '2025-11-12', array['atencao']::client_tag[]),
    ('00000000-0000-4000-8000-000000000103', v_workspace_id, 'BI JOIAS', 'Joalheria', 'Premium', 'ativo', '2025-06-20', array['em-dia']::client_tag[]),
    ('00000000-0000-4000-8000-000000000104', v_workspace_id, 'PLAST RIO', 'Industria', 'Performance', 'ativo', '2024-12-02', array['em-dia']::client_tag[]),
    ('00000000-0000-4000-8000-000000000105', v_workspace_id, 'OTICAS CAROL', 'Otica', 'Pro', 'ativo', '2025-03-15', array['atencao']::client_tag[]),
    ('00000000-0000-4000-8000-000000000106', v_workspace_id, 'O FILE', 'Alimentacao', 'Essencial', 'ativo', '2025-08-08', array['em-dia']::client_tag[]),
    ('00000000-0000-4000-8000-000000000107', v_workspace_id, 'MY CELL CENTER', 'Eletronicos', 'Pro', 'pausado', '2025-02-01', array['critico']::client_tag[]),
    ('00000000-0000-4000-8000-000000000108', v_workspace_id, 'MR AUTOMACOES', 'Servicos', 'Premium', 'ativo', '2025-05-19', array['em-dia']::client_tag[]),
    ('00000000-0000-4000-8000-000000000109', v_workspace_id, 'MC FLATS', 'Imobiliario', 'Performance', 'ativo', '2025-01-10', array['atencao']::client_tag[]),
    ('00000000-0000-4000-8000-000000000110', v_workspace_id, 'MARCELO RADIADOR', 'Automotivo', 'Essencial', 'pausado', '2024-10-25', array['critico']::client_tag[])
  on conflict (id) do update set
    name = excluded.name,
    niche = excluded.niche,
    plan = excluded.plan,
    status = excluded.status,
    start_date = excluded.start_date,
    tags = excluded.tags,
    updated_at = now();

  insert into boards (id, workspace_id, title, gradient)
  values
    ('00000000-0000-4000-8000-000000000201', v_workspace_id, 'Trafego Pago', 'from-neon/30 to-event-blue/20'),
    ('00000000-0000-4000-8000-000000000202', v_workspace_id, 'Social Media', 'from-event-purple/30 to-neon/20'),
    ('00000000-0000-4000-8000-000000000203', v_workspace_id, 'DL | Conteudo', 'from-event-blue/30 to-event-purple/20')
  on conflict (id) do update set
    title = excluded.title,
    gradient = excluded.gradient,
    updated_at = now();

  insert into board_columns (id, board_id, title, position)
  values
    ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000201', 'Backlog', 0),
    ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000201', 'Fazendo', 1),
    ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000201', 'Revisao', 2),
    ('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000201', 'Concluido', 3)
  on conflict (id) do update set
    title = excluded.title,
    position = excluded.position;

  insert into board_cards (id, board_id, column_id, title, labels, assignee_id, checklist_total, checklist_done, due_date, position)
  values
    ('00000000-0000-4000-8000-000000000221', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000211', 'Subir campanha PLAST RIO - junho', array['trafego'], v_owner_id, 5, 1, '2026-06-18', 0),
    ('00000000-0000-4000-8000-000000000222', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000211', 'Revisar publicos OTICAS CAROL', array['trafego', 'revisao'], v_owner_id, 3, 0, null, 1),
    ('00000000-0000-4000-8000-000000000223', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000212', 'Ajuste de orcamento MR AUTOMACOES', array['trafego', 'urgente'], v_owner_id, 2, 1, null, 0)
  on conflict (id) do update set
    column_id = excluded.column_id,
    title = excluded.title,
    labels = excluded.labels,
    assignee_id = excluded.assignee_id,
    checklist_total = excluded.checklist_total,
    checklist_done = excluded.checklist_done,
    due_date = excluded.due_date,
    position = excluded.position,
    updated_at = now();

  insert into tasks (id, workspace_id, title, status, priority, assignee_id, client_id, due_date, done)
  values
    ('00000000-0000-4000-8000-000000000301', v_workspace_id, 'Validar criativos O FILE', 'todo', 'alta', v_owner_id, '00000000-0000-4000-8000-000000000106', '2026-06-16', false),
    ('00000000-0000-4000-8000-000000000302', v_workspace_id, 'Subir campanha PLAST RIO', 'todo', 'alta', v_owner_id, '00000000-0000-4000-8000-000000000104', '2026-06-18', false),
    ('00000000-0000-4000-8000-000000000303', v_workspace_id, 'Responder briefing BI JOIAS', 'doing', 'media', v_owner_id, '00000000-0000-4000-8000-000000000103', '2026-06-19', false)
  on conflict (id) do update set
    title = excluded.title,
    status = excluded.status,
    priority = excluded.priority,
    assignee_id = excluded.assignee_id,
    client_id = excluded.client_id,
    due_date = excluded.due_date,
    done = excluded.done,
    updated_at = now();

  insert into campaigns (id, workspace_id, client_id, status, balance_cents)
  values
    ('00000000-0000-4000-8000-000000000501', v_workspace_id, '00000000-0000-4000-8000-000000000104', 'pausada', 50000),
    ('00000000-0000-4000-8000-000000000502', v_workspace_id, '00000000-0000-4000-8000-000000000106', 'pausada', 30000),
    ('00000000-0000-4000-8000-000000000503', v_workspace_id, '00000000-0000-4000-8000-000000000105', 'pausada', 42000)
  on conflict (id) do update set
    status = excluded.status,
    balance_cents = excluded.balance_cents,
    updated_at = now();

  insert into calendar_events (id, workspace_id, title, type, event_date, event_time, owner_id, client_id)
  values
    ('00000000-0000-4000-8000-000000000601', v_workspace_id, 'Reuniao PLAST RIO', 'reuniao', '2026-06-17', '10:00', v_owner_id, '00000000-0000-4000-8000-000000000104'),
    ('00000000-0000-4000-8000-000000000602', v_workspace_id, 'Subir campanha BI JOIAS', 'campanha', '2026-06-19', '09:00', v_owner_id, '00000000-0000-4000-8000-000000000103'),
    ('00000000-0000-4000-8000-000000000603', v_workspace_id, 'Alinhamento semanal DL', 'reuniao', '2026-06-22', '09:30', v_owner_id, null)
  on conflict (id) do update set
    title = excluded.title,
    type = excluded.type,
    event_date = excluded.event_date,
    event_time = excluded.event_time,
    owner_id = excluded.owner_id,
    client_id = excluded.client_id,
    updated_at = now();

  insert into briefings (id, workspace_id, month_ref)
  values (v_briefing_id, v_workspace_id, '2026-06')
  on conflict (id) do nothing;

  insert into briefing_items (id, briefing_id, client_id, client_name, done)
  values
    ('00000000-0000-4000-8000-000000000411', v_briefing_id, '00000000-0000-4000-8000-000000000101', 'ANDREA BOUTIQUE', true),
    ('00000000-0000-4000-8000-000000000412', v_briefing_id, '00000000-0000-4000-8000-000000000103', 'BI JOIAS', true),
    ('00000000-0000-4000-8000-000000000413', v_briefing_id, null, 'BIBI BOBIT', false)
  on conflict (id) do update set
    client_id = excluded.client_id,
    client_name = excluded.client_name,
    done = excluded.done;

  insert into drive_files (
    id,
    workspace_id,
    name,
    kind,
    file_type,
    owner_name,
    source,
    starred,
    trashed,
    modified_at
  )
  values
    ('00000000-0000-4000-8000-000000000801', v_workspace_id, 'DL DISTRIBUIDORA', 'folder', 'Pasta', 'Admin', 'meu-drive', true, false, '2026-06-10T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000802', v_workspace_id, 'Meet Recordings', 'folder', 'Pasta', 'Admin', 'meu-drive', false, false, '2026-06-14T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000803', v_workspace_id, 'Criativos Junho', 'folder', 'Pasta', 'Ana Lima', 'compartilhados', true, false, '2026-06-15T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000804', v_workspace_id, 'Contrato_PLAST_RIO.pdf', 'file', 'PDF', 'Admin', 'recentes', false, false, '2026-06-09T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000805', v_workspace_id, 'Rascunho_Antigo.docx', 'file', 'Documento', 'Admin', 'meu-drive', false, true, '2026-05-20T00:00:00Z')
  on conflict (id) do update set
    name = excluded.name,
    kind = excluded.kind,
    file_type = excluded.file_type,
    owner_name = excluded.owner_name,
    source = excluded.source,
    starred = excluded.starred,
    trashed = excluded.trashed,
    modified_at = excluded.modified_at;

  insert into activity_logs (id, workspace_id, actor_id, actor_name, action, target, created_at)
  values
    ('00000000-0000-4000-8000-000000000701', v_workspace_id, v_owner_id, 'Admin', 'atualizou', 'PLAST RIO', '2026-06-16T08:10:00Z'),
    ('00000000-0000-4000-8000-000000000702', v_workspace_id, v_owner_id, 'Admin', 'criou briefing de', 'BI JOIAS', '2026-06-15T15:20:00Z')
  on conflict (id) do nothing;
end $$;
