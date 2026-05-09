const { MetaAdsClient } = require('../services/metaAds');
const { GoogleSheetsClient } = require('../services/googleSheets');
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

function sheetRef(client, cell) {
  if (client.sheetName) return `'${client.sheetName}'!${cell}`;
  return cell;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function totalsFromRows(rows) {
  return rows.reduce(
    (acc, row) => ({
      leads: acc.leads + numberValue(row.leads),
      value: acc.value + numberValue(row.gasto),
    }),
    { leads: 0, value: 0 }
  );
}

async function updateCells({ sheetsClient, spreadsheetId, updates, dryRun }) {
  if (dryRun) {
    logger.info(`[DRY RUN] Atualizaria ${updates.length} células em ${spreadsheetId}`);
    for (const update of updates.slice(0, 20)) {
      logger.info(`[DRY RUN] ${update.range} = ${update.values[0][0]}`);
    }
    if (updates.length > 20) logger.info(`[DRY RUN] ... mais ${updates.length - 20} células`);
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

async function fillSheetOnly({ clients, since, until, dryRun = false }) {
  const meta = new MetaAdsClient({ dryRun });
  const sheetsClient = new GoogleSheetsClient();
  const summaries = [];
  const days = dateRangeDays(since, until);

  for (const client of clients) {
    if (client.mode !== 'sheet_only') continue;

    logger.info(`Preenchimento de planilha: ${client.name} | ${since} até ${until}`);
    const updates = [];
    let unitsProcessed = 0;

    for (const unit of client.units || []) {
      if (!unit.adAccountId || unit.adAccountId.includes('PREENCHER')) {
        logger.warn(`Pulando ${client.name} / ${unit.name}: adAccountId não configurado.`);
        continue;
      }

      unitsProcessed += 1;

      for (const day of days) {
        const rows = await meta.getInsights({
          client: {
            ...client,
            key: `${client.key}_${unit.name}`,
            name: `${client.name} / ${unit.name}`,
            adAccountId: unit.adAccountId,
            leadValue: 0,
          },
          level: 'account',
          since: day,
          until: day,
        });

        const total = totalsFromRows(rows);
        const row = dayToRow(day, client.rowOffset || 2);

        if (unit.leadsColumn) {
          updates.push({ range: sheetRef(client, `${unit.leadsColumn}${row}`), values: [[total.leads]] });
        }

        if (unit.valueColumn) {
          updates.push({ range: sheetRef(client, `${unit.valueColumn}${row}`), values: [[total.value]] });
        }

        if (client.writeCpl && unit.cplColumn) {
          const cpl = total.leads > 0 ? total.value / total.leads : '';
          updates.push({ range: sheetRef(client, `${unit.cplColumn}${row}`), values: [[cpl]] });
        }
      }
    }

    if (updates.length > 0) {
      await updateCells({ sheetsClient, spreadsheetId: client.spreadsheetId, updates, dryRun });
    }

    summaries.push({ client: client.key, unitsProcessed, cells: updates.length });
  }

  return summaries;
}

module.exports = { fillSheetOnly, dateRangeDays, dayToRow };
