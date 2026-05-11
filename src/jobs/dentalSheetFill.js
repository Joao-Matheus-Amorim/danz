const { MetaAdsClient } = require('../services/metaAds');
const { GoogleSheetsClient } = require('../services/googleSheets');
const { filterUnits, loadUnits, validateAdAccount } = require('../config/clientRegistry');
const { logger } = require('../utils/logger');

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

function sheetRef(sheetName, cell) {
  return sheetName ? `'${sheetName}'!${cell}` : cell;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

function valueForEmptyMode(value, emptyMode) {
  if (emptyMode === 'blank' && Number(value) === 0) return '';
  return value;
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

async function fillDentalSheet({ scope = {}, since, until, dryRun = false } = {}) {
  const units = filterUnits(loadUnits(), { ...scope, module: scope.module || 'fillDentalSheet', enabled: true });
  const meta = new MetaAdsClient({ dryRun });
  const sheetsClient = new GoogleSheetsClient();
  const days = dateRangeDays(since, until);
  const updatesBySpreadsheet = new Map();
  const results = [];

  logger.info(`Dental Sheet Fill | unidades: ${units.length} | período: ${since} até ${until}`);

  for (const unit of units) {
    const result = {
      unitKey: unit.key,
      unitName: unit.name,
      state: unit.state,
      sheetName: unit.sheetName,
      status: 'pending',
      cells: 0,
      error: null,
    };

    try {
      const adAccountError = validateAdAccount(unit.adAccountId);
      if (adAccountError) {
        result.status = 'skipped';
        result.error = adAccountError;
        results.push(result);
        logger.warn(`Pulando ${unit.name}: ${adAccountError}`);
        continue;
      }

      for (const day of days) {
        const rows = await meta.getInsights({
          client: {
            key: unit.key,
            name: unit.name,
            adAccountId: unit.adAccountId,
            leadValue: 0,
          },
          level: 'account',
          since: day,
          until: day,
        });

        const total = totalsFromRows(rows);
        const row = dayToRow(day, unit.rowOffset);
        const leadsCell = `${unit.columns.leads}${row}`;
        const valueCell = `${unit.columns.value}${row}`;
        const spreadsheetUpdates = updatesBySpreadsheet.get(unit.spreadsheetId) || [];

        spreadsheetUpdates.push({
          range: sheetRef(unit.sheetName, leadsCell),
          values: [[valueForEmptyMode(total.leads, unit.emptyMode)]],
        });
        spreadsheetUpdates.push({
          range: sheetRef(unit.sheetName, valueCell),
          values: [[valueForEmptyMode(total.value, unit.emptyMode)]],
        });

        updatesBySpreadsheet.set(unit.spreadsheetId, spreadsheetUpdates);
        result.cells += 2;
      }

      result.status = 'success';
    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      logger.error(`Erro em ${unit.name}: ${error.message}`);
    }

    results.push(result);
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
};
