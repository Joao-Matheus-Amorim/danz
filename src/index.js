require('dotenv').config();

const {
  getClients,
  getMetaClients,
  getSheetOnlyClients,
  missingAccountClients,
} = require('./config/clients');
const { parseArgs } = require('./utils/cli');
const { currentMonthRange } = require('./utils/date');
const { resolveDateRange } = require('./domain/dateRangeResolver');
const { getCompany } = require('./config/companyLoader');
const { logger } = require('./utils/logger');
const { MetaAdsClient } = require('./services/metaAds');
const { GoogleSheetsClient } = require('./services/googleSheets');
const { syncSheets } = require('./jobs/syncSheets');
const { analyzeCampaigns } = require('./jobs/analyzeCampaigns');
const { buildDashboard } = require('./jobs/buildDashboard');
const { checkAlerts } = require('./jobs/checkAlerts');
const { fillSheetOnly } = require('./jobs/fillSheetOnly');
const { loadUnits, filterUnits, validateRegistry, summarizeRegistryValidation } = require('./config/clientRegistry');
const { fillDentalSheet } = require('./jobs/dentalSheetFill');

async function validate(clients, dryRun = false) {
  const metaClients = getMetaClients(clients);
  const sheetOnlyClients = getSheetOnlyClients(clients);
  const sheets = new GoogleSheetsClient();

  if (metaClients.length > 0 || sheetOnlyClients.some((client) => (client.units || []).some((unit) => !String(unit.adAccountId || '').includes('PREENCHER')))) {
    const meta = new MetaAdsClient({ dryRun });
    const me = await meta.validateToken();
    logger.info(`Meta API OK: ${me.name || me.id}`);
  }

  const uniqueSheets = [...new Set(clients.map((client) => client.spreadsheetId).filter(Boolean))];
  for (const spreadsheetId of uniqueSheets) {
    if (dryRun) {
      logger.info(`[DRY RUN] Validaria Google Sheets: ${spreadsheetId}`);
      continue;
    }
    const sheet = await sheets.validate(spreadsheetId);
    logger.info(`Google Sheets OK: ${sheet.properties.title}`);
  }

  const missing = missingAccountClients(clients);
  if (missing.length) {
    logger.warn(`Clientes/unidades sem adAccountId real: ${missing.map((client) => client.name).join(', ')}`);
  }
}

function cleanScope(scope = {}) {
  return Object.fromEntries(Object.entries(scope).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

function resolveCompanyContext(scope = {}, args = {}) {
  const companyId = scope.company || 'cmp_dental_leads';
  const company = getCompany(companyId) || {};
  return {
    companyId,
    company,
    timeZone: args.timeZone || company.timeZone || process.env.DEFAULT_CLIENT_TIMEZONE || 'UTC',
    defaultDateMode: args.defaultDateMode || company.defaultDateMode || 'month-to-date',
  };
}

function printRegistryList(args) {
  const scope = cleanScope(args.scope);
  const units = filterUnits(loadUnits(), scope);
  const limited = args.limit ? units.slice(0, args.limit) : units;

  logger.info(`Unidades encontradas: ${units.length}`);
  for (const unit of limited) {
    logger.info([
      unit.companyId,
      unit.group,
      unit.segment,
      unit.state,
      unit.city || '-',
      unit.name,
      unit.adAccountId,
      `${unit.sheetName}!${unit.columns.leads}/${unit.columns.value}`,
    ].join(' | '));
  }
  if (limited.length < units.length) logger.info(`... mais ${units.length - limited.length} unidades`);
}

function printRegistryValidation(args) {
  const scope = cleanScope(args.scope);
  const report = validateRegistry(scope);
  const summary = summarizeRegistryValidation(report.results);
  logger.info(`Registry validate | total=${report.total} válidas=${report.valid} inválidas=${report.invalid}`);

  for (const group of summary.groupedPendingAdAccounts) {
    logger.warn(`adAccountId pendente (${group.state}) — ${group.count} unidade(s). Mantido como fallback até preencher act real.`);
  }

  for (const item of summary.detailedInvalid) {
    logger.warn(`${item.unit.name} (${item.unit.state}) — ${item.errors.join('; ')}`);
  }
}

function printDentalFillResult(result) {
  if (Array.isArray(result.diagnostics) && result.diagnostics.length > 0) {
    for (const diagnostic of result.diagnostics) {
      logger.warn(diagnostic.message);
    }
  }

  logger.info(`Dental fill finalizado | unidades=${result.totalUnits} sucesso=${result.success} puladas=${result.skipped} erros=${result.errors}`);

  const detailedWarnings = result.results.filter((entry) => entry.status !== 'success' && entry.groupedSkip !== true);
  for (const item of detailedWarnings) {
    logger.warn(`${item.unitName} (${item.state}) — ${item.status}: ${item.error}`);
  }

  const groupedSkipped = result.results.filter((entry) => entry.groupedSkip === true).length;
  if (groupedSkipped > 0) {
    logger.info(`Avisos agrupados: ${groupedSkipped} unidades puladas por diagnóstico central já exibido.`);
  }
}

async function main() {
  const args = parseArgs();
  const scope = cleanScope(args.scope);
  const companyContext = resolveCompanyContext(scope, args);
  const defaultRange = currentMonthRange();
  const operationalRange = resolveDateRange({
    since: args.since,
    until: args.until,
    day: args.day,
    today: args.today,
    pendingMonth: args.pendingMonth,
    monthToDate: args.monthToDate,
    timeZone: companyContext.timeZone,
    defaultDateMode: companyContext.defaultDateMode,
  });
  const since = operationalRange.since || defaultRange.since;
  const until = operationalRange.until || defaultRange.until;

  logger.info('='.repeat(70));
  logger.info(`Comando: ${args.command} | Período: ${since} até ${until} | modo=${operationalRange.mode} | dataOperacional=${operationalRange.operationalDate} | fuso=${operationalRange.timeZone}`);
  logger.info(`Dry-run: ${args.dryRun} | No-actions: ${args.noActions}`);
  logger.info('='.repeat(70));

  if (args.command === 'registry:list') {
    printRegistryList(args);
    return;
  }

  if (args.command === 'registry:validate') {
    printRegistryValidation(args);
    return;
  }

  if (['dental:fill', 'dental-sheet:fill'].includes(args.command)) {
    const result = await fillDentalSheet({
      scope,
      since,
      until,
      dryRun: args.dryRun,
      fields: args.fields,
      delivery: args.delivery,
      sheetName: args.sheetName,
    });
    printDentalFillResult(result);
    return;
  }

  const clients = getClients(args.client);
  const metaClients = getMetaClients(clients);
  const sheetOnlyClients = getSheetOnlyClients(clients);

  logger.info(`Cliente legado: ${args.client}`);

  if (['validate', 'validar'].includes(args.command)) {
    await validate(clients, args.dryRun);
    return;
  }

  if (['preenchimento', 'fill'].includes(args.command)) {
    await fillSheetOnly({ clients: sheetOnlyClients, since, until, dryRun: args.dryRun });
    if (metaClients.length) {
      await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
    }
    return;
  }

  if (args.command === 'sync') {
    await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'analyze') {
    await analyzeCampaigns({ clients: metaClients, since, until, dryRun: args.dryRun, noActions: args.noActions });
    return;
  }

  if (args.command === 'dashboard') {
    await buildDashboard({ clients: metaClients, since, until, dryRun: args.dryRun });
    return;
  }

  if (['alerts', 'alertas'].includes(args.command)) {
    await checkAlerts({ clients: metaClients, dryRun: args.dryRun });
    return;
  }

  if (args.command === 'run') {
    if (sheetOnlyClients.length) {
      await fillSheetOnly({ clients: sheetOnlyClients, since, until, dryRun: args.dryRun });
    }
    if (metaClients.length) {
      await syncSheets({ clients: metaClients, since, until, dryRun: args.dryRun });
      const analysis = await analyzeCampaigns({ clients: metaClients, since, until, dryRun: args.dryRun, noActions: args.noActions });
      await buildDashboard({ clients: metaClients, since, until, dryRun: args.dryRun, analyzedAdsByClient: analysis.analyzedAdsByClient });
      await checkAlerts({ clients: metaClients, dryRun: args.dryRun });
    }
    return;
  }

  throw new Error(`Comando inválido: ${args.command}. Use registry:list, registry:validate, dental:fill, run, preenchimento, sync, analyze, dashboard, alerts ou validate.`);
}

main().catch((error) => {
  logger.error(error.stack || error.message);
  process.exit(1);
});
