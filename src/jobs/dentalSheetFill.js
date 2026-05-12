const { MetaAdsClient } = require('../services/metaAds');
const { GoogleSheetsClient } = require('../services/googleSheets');
const { filterUnits, loadUnits, validateAdAccount } = require('../config/clientRegistry');
const { logger } = require('../utils/logger');
const { saveUnitRunResult } = require('../database/repositories');
const { resolveSheetNameForUnit } = require('../domain/sheetResolver');
const { getSegmentAdapter, odontologiaAdapter } = require('../segments');

function dateRangeDays(since, until) {
  const days = [];
  const current = new Date(`${since}T00:00:00`);
  const end = new Date(`${until}T00:00:00`);

  while (current <= end) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function dayToRow(date, rowOffset = 2) {
  const day = Number(String(date).slice(8, 10));
  return day + Number(rowOffset);
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFields(fields = 'leads,value', segment = 'odontologia') {
  return getSegmentAdapter(segment).parseFields(fields);
}

function metricMatchesUnit(row, unit) {
  return getSegmentAdapter(unit.segment).matchMetricToUnit(row, unit);
}

function filterRowsForUnit(rows = [], unit) {
  return getSegmentAdapter(unit.segment).filterRowsForUnit(rows, unit);
}

function totalsFromRows(rows = []) {
  return rows.reduce(
    (acc, row) => ({
      leads: acc.leads + numberValue(row.leads),
      value: acc.value + numberValue(row.gasto),
    }),
    { leads: 0, value: 0 }
  );
}

function persistUnitResult(result) {
  try {
    saveUnitRunResult(result);
  } catch (error) {
    logger.warn(`Falha ao persistir resultado da unidade ${result.unitKey}: ${error.message}`);
  }
}

function buildFieldUpdates({ unit, sheetName, row, total, selectedFields }) {
  return getSegmentAdapter(unit.segment).buildFieldUpdates({ unit, sheetName, row, total, selectedFields });
}

function sharedAccountKey(unit) {
  return [unit.companyId || 'sem_empresa', unit.state || 'sem_estado', unit.sharedAdAccountId || unit.adAccountId || 'sem_conta'].join('|');
}

function groupedSharedAccountDiagnostics(units = []) {
  const groups = new Map();

  for (const unit of units) {
    if (unit.meta?.mode !== 'shared_ad_account') continue;
    const adAccountId = unit.sharedAdAccountId || unit.adAccountId;
    const error = validateAdAccount(adAccountId);
    if (!error) continue;

    const key = sharedAccountKey(unit);
    const group = groups.get(key) || {
      type: 'shared_ad_account_invalid',
      companyId: unit.companyId,
      companyName: unit.companyName,
      state: unit.state,
      adAccountId,
      reason: error,
      units: [],
    };
    group.units.push(unit);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    unitCount: group.units.length,
    message: `${group.companyName || group.companyId} / ${group.state}: conta Meta central pendente (${group.adAccountId}). ${group.units.length} clínicas dependem dessa conta.`,
  }));
}

function buildSkippedResultForBlockedUnit({ unit, diagnostic, since, until, dryRun, scope, fields, delivery, jobRunId }) {
  const now = new Date().toISOString();
  return {
    jobRunId,
    companyId: unit.companyId,
    unitKey: unit.key,
    unitName: unit.name,
    state: unit.state,
    city: unit.city,
    sheetName: null,
    metaMode: unit.meta?.mode || 'single_ad_account',
    status: 'skipped',
    cells: 0,
    matchedRows: 0,
    error: diagnostic.reason,
    groupedSkip: true,
    startedAt: now,
    finishedAt: now,
    details: {
      since,
      until,
      dryRun,
      scope,
      fields,
      delivery,
      diagnostic: {
        type: diagnostic.type,
        adAccountId: diagnostic.adAccountId,
        unitCount: diagnostic.unitCount,
      },
    },
  };
}

async function updateCells({ sheetsClient, spreadsheetId, updates, dryRun }) {
  if (dryRun) {
    logger.info(`[DRY RUN] Atualizaria ${updates.length} células em ${spreadsheetId}`);
    for (const update of updates.slice(0, 40)) {
      logger.info(`[DRY RUN] ${update.range} = ${update.values[0][0]}`);
    }
    if (updates.length > 40) logger.info(`[DRY RUN] ... mais ${updates.length - 40} células`);
    return { dryRun: true, cells: updates.length };
  }

  const sheets = await sheetsClient.getSheets();
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates,
    },
  });
  return { cells: updates.length };
}

async function getRowsForDay({ meta, unit, day }) {
  const insightLevel = unit.meta?.insightLevel || (unit.meta?.mode === 'shared_ad_account' ? 'campaign' : 'account');
  const rows = await meta.getInsights({
    client: {
      key: unit.key,
      name: unit.name,
      adAccountId: unit.adAccountId,
      leadValue: 0,
    },
    level: insightLevel,
    since: day,
    until: day,
  });

  return filterRowsForUnit(rows, unit);
}

async function fillDentalSheet({
  scope = {},
  since,
  until,
  dryRun = false,
  jobRunId = null,
  fields = 'leads,value',
  delivery = 'none',
  sheetName = null,
} = {}) {
  const adapter = odontologiaAdapter;
  const units = filterUnits(loadUnits(), { ...scope, module: scope.module || adapter.defaultModule, enabled: true });
  const meta = new MetaAdsClient({ dryRun });
  const sheetsClient = new GoogleSheetsClient();
  const days = dateRangeDays(since, until);
  const selectedFields = adapter.parseFields(fields);
  const updatesBySpreadsheet = new Map();
  const results = [];
  const diagnostics = groupedSharedAccountDiagnostics(units);
  const blockedUnitKeys = new Set();

  logger.info(`Dental Sheet Fill | unidades: ${units.length} | período: ${since} até ${until} | campos=${selectedFields.join(',')} | delivery=${delivery}`);

  for (const diagnostic of diagnostics) {
    for (const unit of diagnostic.units) {
      blockedUnitKeys.add(unit.groupKey || unit.key);
      const result = buildSkippedResultForBlockedUnit({
        unit,
        diagnostic,
        since,
        until,
        dryRun,
        scope,
        fields: selectedFields,
        delivery,
        jobRunId,
      });
      results.push(result);
      persistUnitResult(result);
    }
  }

  for (const unit of units) {
    if (blockedUnitKeys.has(unit.groupKey || unit.key)) continue;

    const result = {
      jobRunId,
      companyId: unit.companyId,
      unitKey: unit.key,
      unitName: unit.name,
      state: unit.state,
      city: unit.city,
      sheetName: null,
      metaMode: unit.meta?.mode || 'single_ad_account',
      status: 'pending',
      cells: 0,
      matchedRows: 0,
      error: null,
      groupedSkip: false,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      details: { since, until, dryRun, scope, fields: selectedFields, delivery },
    };

    try {
      const adAccountError = validateAdAccount(unit.adAccountId);
      if (adAccountError) {
        result.status = 'skipped';
        result.error = adAccountError;
        result.finishedAt = new Date().toISOString();
        results.push(result);
        persistUnitResult(result);
        logger.warn(`Pulando ${unit.name}: ${adAccountError}`);
        continue;
      }

      const unitAdapter = getSegmentAdapter(unit.segment);
      for (const day of days) {
        const resolvedSheetName = sheetName || resolveSheetNameForUnit(unit, day, { sheetName });
        result.sheetName = result.sheetName || resolvedSheetName;
        const rows = await getRowsForDay({ meta, unit, day });
        result.matchedRows += rows.length;
        const total = totalsFromRows(rows);
        const row = dayToRow(day, unit.rowOffset);
        const spreadsheetUpdates = updatesBySpreadsheet.get(unit.spreadsheetId) || [];
        const fieldUpdates = unitAdapter.buildFieldUpdates({ unit, sheetName: resolvedSheetName, row, total, selectedFields });

        spreadsheetUpdates.push(...fieldUpdates);
        updatesBySpreadsheet.set(unit.spreadsheetId, spreadsheetUpdates);
        result.cells += fieldUpdates.length;
      }

      result.status = 'success';
      result.finishedAt = new Date().toISOString();
    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      result.finishedAt = new Date().toISOString();
      logger.error(`Erro em ${unit.name}: ${error.message}`);
    }

    results.push(result);
    persistUnitResult(result);
  }

  const sheetResults = [];
  for (const [spreadsheetId, updates] of updatesBySpreadsheet.entries()) {
    if (updates.length === 0) continue;
    const writeResult = await updateCells({ sheetsClient, spreadsheetId, updates, dryRun });
    sheetResults.push({ spreadsheetId, ...writeResult });
  }

  return {
    scope,
    since,
    until,
    dryRun,
    fields: selectedFields,
    delivery,
    diagnostics: diagnostics.map(({ units: diagnosticUnits, ...diagnostic }) => ({
      ...diagnostic,
      unitKeys: diagnosticUnits.map((unit) => unit.key),
    })),
    totalUnits: units.length,
    success: results.filter((item) => item.status === 'success').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    errors: results.filter((item) => item.status === 'error').length,
    sheetResults,
    results,
  };
}

module.exports = {
  fillDentalSheet,
  dateRangeDays,
  dayToRow,
  totalsFromRows,
  metricMatchesUnit,
  filterRowsForUnit,
  parseFields,
  buildFieldUpdates,
  groupedSharedAccountDiagnostics,
};
