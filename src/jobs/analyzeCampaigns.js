const { MetaAdsClient } = require('../services/metaAds');
const { MetaActionsClient } = require('../services/metaActions');
const { GoogleSheetsClient } = require('../services/googleSheets');
const { analyzeRows, onlyActionable } = require('../domain/analyzer');
const { sendWhatsApp, formatCreativeAlert } = require('../services/alerts');
const { rules } = require('../config/rules');
const { logger } = require('../utils/logger');

function shouldPause(row) {
  return ['SEM_LEAD_COM_GASTO', 'CPL_ALTO'].includes(row.status_analise);
}

function shouldRunMetaAction(row, noActions) {
  return !noActions && rules.actionMode === 'auto_pause' && rules.autoPauseEnabled && shouldPause(row);
}

async function analyzeCampaigns({ clients, since, until, dryRun = false, noActions = false }) {
  const meta = new MetaAdsClient({ dryRun });
  const sheets = new GoogleSheetsClient();
  const analyzedAdsByClient = new Map();
  const summaries = [];
  let actions = null;

  for (const client of clients) {
    if (!client.adAccountId || client.adAccountId.includes('PREENCHER')) {
      logger.warn(`Pulando análise de ${client.name}: adAccountId não configurado.`);
      continue;
    }

    logger.info(`Analisando campanhas/conjuntos/criativos: ${client.name}`);
    const campaigns = await meta.getInsights({ client, level: 'campaign', since, until });
    const ads = await meta.getInsights({ client, level: 'ad', since, until });

    const analyzedCampaigns = analyzeRows(campaigns, rules, 'campaign');
    const analyzedAds = analyzeRows(ads, rules, 'creative');
    const actionable = onlyActionable(analyzedAds);

    analyzedAdsByClient.set(client.key, analyzedAds);

    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Campanhas Análise`, analyzedCampaigns, dryRun);
    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Criativos Análise`, analyzedAds, dryRun);
    await sheets.clearAndWrite(client.spreadsheetId, `${client.tabPrefix} - Alertas`, actionable, dryRun);

    for (const row of actionable) {
      await sendWhatsApp(formatCreativeAlert(row), dryRun);

      if (shouldRunMetaAction(row, noActions)) {
        actions = actions || new MetaActionsClient();
        await actions.pauseAd(row.ad_id, dryRun);
      }
    }

    summaries.push({ client: client.key, ads: analyzedAds.length, actionable: actionable.length });
  }

  return { summaries, analyzedAdsByClient };
}

module.exports = { analyzeCampaigns };
