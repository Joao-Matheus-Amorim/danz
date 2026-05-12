const { logger } = require('../utils/logger');
const { createNotification } = require('./notificationCenter');

const DELIVERY_MODES = new Set(['none', 'log', 'notify', 'approval']);

function normalizeDeliveryMode(delivery = 'none') {
  const mode = String(delivery || 'none').trim().toLowerCase();
  if (!DELIVERY_MODES.has(mode)) {
    throw new Error(`Delivery inválido: ${delivery}. Use: none,log,notify,approval.`);
  }
  return mode;
}

function summarizeRunResult(result = {}) {
  return {
    scope: result.scope || {},
    since: result.since,
    until: result.until,
    dryRun: Boolean(result.dryRun),
    fields: result.fields || [],
    totalUnits: Number(result.totalUnits || 0),
    success: Number(result.success || 0),
    skipped: Number(result.skipped || 0),
    errors: Number(result.errors || 0),
    diagnostics: (result.diagnostics || []).map((diagnostic) => ({
      type: diagnostic.type,
      companyId: diagnostic.companyId,
      companyName: diagnostic.companyName,
      state: diagnostic.state,
      reason: diagnostic.reason,
      unitCount: diagnostic.unitCount,
      message: diagnostic.message,
    })),
    sheetResults: result.sheetResults || [],
  };
}

function buildDeliveryMessage(summary) {
  return [
    `Período: ${summary.since} até ${summary.until}`,
    `Unidades: ${summary.totalUnits}`,
    `Sucesso: ${summary.success}`,
    `Puladas: ${summary.skipped}`,
    `Erros: ${summary.errors}`,
    `Campos: ${(summary.fields || []).join(',') || '-'}`,
  ].join('\n');
}

function logDelivery(summary) {
  logger.info(`Delivery log | unidades=${summary.totalUnits} sucesso=${summary.success} puladas=${summary.skipped} erros=${summary.errors}`);
  for (const diagnostic of summary.diagnostics || []) {
    if (diagnostic.message) logger.warn(`Delivery diagnóstico | ${diagnostic.message}`);
  }
}

function createDeliveryNotification({ mode, summary }) {
  const requiresApproval = mode === 'approval';
  return createNotification({
    channel: 'internal',
    client: summary.scope?.company || summary.diagnostics?.[0]?.companyName || 'Dental Leads',
    type: requiresApproval ? 'APPROVAL_REQUIRED' : 'DELIVERY_SUMMARY',
    severity: summary.errors > 0 ? 'warning' : 'info',
    title: requiresApproval ? 'Aprovação pendente para entrega operacional' : 'Resumo de entrega operacional',
    message: buildDeliveryMessage(summary),
    action: requiresApproval ? 'Revisar resultado antes de executar entrega real' : null,
    payload: summary,
    status: requiresApproval ? 'pending_approval' : 'created',
  });
}

function applyDelivery(result = {}, delivery = 'none') {
  const mode = normalizeDeliveryMode(delivery);
  const summary = summarizeRunResult({ ...result, delivery: mode });
  const deliveryResult = {
    mode,
    status: 'skipped',
    notification: null,
  };

  if (mode === 'none') {
    deliveryResult.status = 'none';
    return deliveryResult;
  }

  if (mode === 'log') {
    logDelivery(summary);
    deliveryResult.status = 'logged';
    return deliveryResult;
  }

  if (mode === 'notify') {
    deliveryResult.notification = createDeliveryNotification({ mode, summary });
    deliveryResult.status = 'notification_created';
    return deliveryResult;
  }

  if (mode === 'approval') {
    logDelivery(summary);
    deliveryResult.notification = createDeliveryNotification({ mode, summary });
    deliveryResult.status = 'pending_approval';
    return deliveryResult;
  }

  return deliveryResult;
}

function shouldWriteSheets({ dryRun = false, delivery = 'none' } = {}) {
  const mode = normalizeDeliveryMode(delivery);
  if (dryRun) return false;
  if (mode === 'approval') return false;
  return true;
}

module.exports = {
  DELIVERY_MODES,
  normalizeDeliveryMode,
  summarizeRunResult,
  buildDeliveryMessage,
  applyDelivery,
  shouldWriteSheets,
};
