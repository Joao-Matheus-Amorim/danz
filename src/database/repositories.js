const { getDb } = require('./db');

function json(value) {
  return JSON.stringify(value ?? null);
}

function parseJson(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function mapNotification(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    sentAt: row.sent_at,
    channel: row.channel,
    provider: row.provider,
    client: row.client,
    type: row.type,
    severity: row.severity,
    title: row.title,
    message: row.message,
    action: row.action,
    payload: parseJson(row.payload_json, {}),
    status: row.status,
    providerResponse: parseJson(row.provider_response_json, null),
  };
}

function saveNotification(notification) {
  const db = getDb();
  if (!db) return false;

  db.prepare(`
    INSERT INTO notifications (
      id, created_at, sent_at, channel, provider, client, type, severity,
      title, message, action, payload_json, status, provider_response_json
    ) VALUES (
      @id, @created_at, @sent_at, @channel, @provider, @client, @type, @severity,
      @title, @message, @action, @payload_json, @status, @provider_response_json
    )
    ON CONFLICT(id) DO UPDATE SET
      sent_at = excluded.sent_at,
      provider = excluded.provider,
      status = excluded.status,
      provider_response_json = excluded.provider_response_json,
      payload_json = excluded.payload_json
  `).run({
    id: notification.id,
    created_at: notification.createdAt,
    sent_at: notification.sentAt || null,
    channel: notification.channel || 'whatsapp',
    provider: notification.provider || null,
    client: notification.client || null,
    type: notification.type || null,
    severity: notification.severity || null,
    title: notification.title || null,
    message: notification.message || null,
    action: notification.action || null,
    payload_json: json(notification.payload || {}),
    status: notification.status || 'created',
    provider_response_json: json(notification.providerResponse || null),
  });

  return true;
}

function listPersistedNotifications({ limit = 50 } = {}) {
  const db = getDb();
  if (!db) return null;

  return db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?')
    .all(Number(limit || 50))
    .map(mapNotification);
}

function saveWhatsappReply(reply) {
  const db = getDb();
  if (!db) return false;

  db.prepare(`
    INSERT OR REPLACE INTO whatsapp_replies (
      id, received_at, sender, text, interpreted_action, raw_body_json
    ) VALUES (@id, @received_at, @sender, @text, @interpreted_action, @raw_body_json)
  `).run({
    id: reply.id,
    received_at: reply.receivedAt,
    sender: reply.from,
    text: reply.text,
    interpreted_action: reply.interpretedAction,
    raw_body_json: json(reply.rawBody || {}),
  });

  return true;
}

function listPersistedWhatsappReplies({ limit = 50 } = {}) {
  const db = getDb();
  if (!db) return null;

  return db.prepare('SELECT * FROM whatsapp_replies ORDER BY received_at DESC LIMIT ?')
    .all(Number(limit || 50))
    .map((row) => ({
      id: row.id,
      receivedAt: row.received_at,
      from: row.sender,
      text: row.text,
      interpretedAction: row.interpreted_action,
      rawBody: parseJson(row.raw_body_json, {}),
    }));
}

function saveJobRun(run) {
  const db = getDb();
  if (!db) return false;

  db.prepare(`
    INSERT INTO job_runs (id, task_key, mode, started_at, finished_at, status, result_json)
    VALUES (@id, @task_key, @mode, @started_at, @finished_at, @status, @result_json)
    ON CONFLICT(id) DO UPDATE SET
      finished_at = excluded.finished_at,
      status = excluded.status,
      result_json = excluded.result_json
  `).run({
    id: run.id,
    task_key: run.taskKey,
    mode: run.mode,
    started_at: run.startedAt,
    finished_at: run.finishedAt || null,
    status: run.status,
    result_json: json(run.result || null),
  });

  return true;
}

function saveJobRunStep(jobRunId, step) {
  const db = getDb();
  if (!db) return false;
  const id = step.id || uid('step');

  db.prepare(`
    INSERT INTO job_run_steps (id, job_run_id, step_key, label, status, at, details_json)
    VALUES (@id, @job_run_id, @step_key, @label, @status, @at, @details_json)
  `).run({
    id,
    job_run_id: jobRunId,
    step_key: step.key,
    label: step.label,
    status: step.status,
    at: step.at,
    details_json: json(step.details || {}),
  });

  return true;
}

function mapJobRun(row) {
  return {
    id: row.id,
    taskKey: row.task_key,
    mode: row.mode,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    result: parseJson(row.result_json, null),
    steps: [],
  };
}

function listPersistedJobRuns({ limit = 50 } = {}) {
  const db = getDb();
  if (!db) return null;

  const runs = db.prepare('SELECT * FROM job_runs ORDER BY started_at DESC LIMIT ?')
    .all(Number(limit || 50))
    .map(mapJobRun);

  const stepsStmt = db.prepare('SELECT * FROM job_run_steps WHERE job_run_id = ? ORDER BY at ASC');
  for (const run of runs) {
    run.steps = stepsStmt.all(run.id).map((row) => ({
      id: row.id,
      key: row.step_key,
      label: row.label,
      status: row.status,
      at: row.at,
      details: parseJson(row.details_json, {}),
    }));
  }

  return runs;
}

function saveUnitRunResult(result) {
  const db = getDb();
  if (!db) return false;
  const id = result.id || uid('unit');

  db.prepare(`
    INSERT OR REPLACE INTO unit_run_results (
      id, job_run_id, company_id, unit_key, unit_name, state, city, sheet_name,
      status, cells, matched_rows, error, started_at, finished_at, details_json
    ) VALUES (
      @id, @job_run_id, @company_id, @unit_key, @unit_name, @state, @city, @sheet_name,
      @status, @cells, @matched_rows, @error, @started_at, @finished_at, @details_json
    )
  `).run({
    id,
    job_run_id: result.jobRunId || null,
    company_id: result.companyId || null,
    unit_key: result.unitKey || null,
    unit_name: result.unitName || null,
    state: result.state || null,
    city: result.city || null,
    sheet_name: result.sheetName || null,
    status: result.status || null,
    cells: Number(result.cells || 0),
    matched_rows: Number(result.matchedRows || 0),
    error: result.error || null,
    started_at: result.startedAt || null,
    finished_at: result.finishedAt || null,
    details_json: json(result.details || {}),
  });

  return true;
}

function listUnitRunResults({ jobRunId, limit = 100 } = {}) {
  const db = getDb();
  if (!db) return null;

  if (jobRunId) {
    return db.prepare('SELECT * FROM unit_run_results WHERE job_run_id = ? ORDER BY started_at DESC LIMIT ?')
      .all(jobRunId, Number(limit || 100));
  }

  return db.prepare('SELECT * FROM unit_run_results ORDER BY started_at DESC LIMIT ?')
    .all(Number(limit || 100));
}

module.exports = {
  saveNotification,
  listPersistedNotifications,
  saveWhatsappReply,
  listPersistedWhatsappReplies,
  saveJobRun,
  saveJobRunStep,
  listPersistedJobRuns,
  saveUnitRunResult,
  listUnitRunResults,
};
