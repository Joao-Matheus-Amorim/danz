const {
  listPersistedNotifications,
  listPersistedJobRuns,
  listUnitRunResults,
} = require('../database/repositories');

function parseJson(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function normalizeLimit(value, fallback = 50, max = 200) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function normalizeTextFilter(value) {
  const clean = String(value || '').trim();
  return clean || null;
}

function normalizeUnitRunResult(row = {}) {
  return {
    id: row.id,
    jobRunId: row.job_run_id || row.jobRunId || null,
    companyId: row.company_id || row.companyId || null,
    unitKey: row.unit_key || row.unitKey || null,
    unitName: row.unit_name || row.unitName || null,
    state: row.state || null,
    city: row.city || null,
    sheetName: row.sheet_name || row.sheetName || null,
    status: row.status || null,
    cells: Number(row.cells || 0),
    matchedRows: Number(row.matched_rows ?? row.matchedRows ?? 0),
    error: row.error || null,
    startedAt: row.started_at || row.startedAt || null,
    finishedAt: row.finished_at || row.finishedAt || null,
    details: row.details || parseJson(row.details_json, {}),
  };
}

function filterUnitResults(rows = [], filters = {}) {
  const state = normalizeTextFilter(filters.state);
  const status = normalizeTextFilter(filters.status);
  const companyId = normalizeTextFilter(filters.companyId || filters.company);

  return rows.filter((row) => {
    if (state && String(row.state || '').toLowerCase() !== state.toLowerCase()) return false;
    if (status && String(row.status || '').toLowerCase() !== status.toLowerCase()) return false;
    if (companyId && String(row.companyId || row.company_id || '').toLowerCase() !== companyId.toLowerCase()) return false;
    return true;
  });
}

function listNotificationHistory({ limit } = {}) {
  const safeLimit = normalizeLimit(limit, 50, 200);
  return {
    ok: true,
    data: listPersistedNotifications({ limit: safeLimit }) || [],
    meta: { limit: safeLimit },
  };
}

function listJobRunHistory({ limit } = {}) {
  const safeLimit = normalizeLimit(limit, 50, 200);
  return {
    ok: true,
    data: listPersistedJobRuns({ limit: safeLimit }) || [],
    meta: { limit: safeLimit },
  };
}

function listUnitResultHistory({ limit, jobRunId, state, status, companyId } = {}) {
  const safeLimit = normalizeLimit(limit, 100, 500);
  const rows = listUnitRunResults({ jobRunId: jobRunId || undefined, limit: safeLimit }) || [];
  const normalized = rows.map(normalizeUnitRunResult);
  const filtered = filterUnitResults(normalized, { state, status, companyId });

  return {
    ok: true,
    data: filtered,
    meta: {
      limit: safeLimit,
      filters: {
        jobRunId: jobRunId || null,
        state: state || null,
        status: status || null,
        companyId: companyId || null,
      },
      total: filtered.length,
    },
  };
}

module.exports = {
  parseJson,
  normalizeLimit,
  normalizeUnitRunResult,
  filterUnitResults,
  listNotificationHistory,
  listJobRunHistory,
  listUnitResultHistory,
};
