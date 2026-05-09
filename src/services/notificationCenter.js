const axios = require('axios');
const { logger } = require('../utils/logger');

const notifications = [];
const whatsappReplies = [];

function nowIso() {
  return new Date().toISOString();
}

function createNotification({
  channel = 'whatsapp',
  client = 'Sistema',
  type = 'INFO',
  severity = 'info',
  title = 'Notificação',
  message = '',
  action = null,
  payload = {},
  status = 'created',
} = {}) {
  const notification = {
    id: `ntf_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    createdAt: nowIso(),
    channel,
    client,
    type,
    severity,
    title,
    message,
    action,
    payload,
    status,
  };
  notifications.unshift(notification);
  return notification;
}

function listNotifications({ limit = 50 } = {}) {
  return notifications.slice(0, limit);
}

function listWhatsappReplies({ limit = 50 } = {}) {
  return whatsappReplies.slice(0, limit);
}

function formatWhatsappMessage(notification) {
  return [
    `*${notification.title}*`,
    `Cliente: ${notification.client}`,
    `Tipo: ${notification.type}`,
    `Prioridade: ${notification.severity}`,
    '',
    notification.message,
    notification.action ? `\nAção sugerida: ${notification.action}` : '',
    '',
    'Responda:',
    '1 - Pausar/desativar',
    '2 - Criar campanha teste isolada',
    '3 - Manter rodando',
  ].filter(Boolean).join('\n');
}

async function dispatchWhatsapp(notification, { dryRun = false } = {}) {
  const provider = process.env.WHATSAPP_PROVIDER || 'mock';
  const text = formatWhatsappMessage(notification);

  if (dryRun || provider === 'mock' || provider === 'none') {
    notification.status = 'mock_sent';
    notification.sentAt = nowIso();
    notification.provider = provider;
    logger.warn(`[WHATSAPP MOCK] ${text}`);
    return { ok: true, dryRun: true, provider, notificationId: notification.id, message: text };
  }

  if (provider !== 'zapi') {
    notification.status = 'skipped_provider_unsupported';
    notification.provider = provider;
    logger.warn(`Provider WhatsApp não suportado: ${provider}. Mensagem registrada como mock.`);
    return { ok: false, provider, skipped: true, notificationId: notification.id };
  }

  const instance = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  const phone = process.env.WHATSAPP_TO;

  if (!instance || !token || !phone) {
    notification.status = 'skipped_missing_zapi_env';
    notification.provider = provider;
    logger.warn('Z-API incompleta. Mensagem registrada, mas não enviada.');
    return { ok: false, skipped: true, reason: 'missing_zapi_env', notificationId: notification.id };
  }

  const url = `https://api.z-api.io/instances/${instance}/token/${token}/send-text`;
  const headers = clientToken ? { 'Client-Token': clientToken } : {};
  const response = await axios.post(url, { phone, message: text }, { headers, timeout: 15000 });

  notification.status = 'sent';
  notification.sentAt = nowIso();
  notification.provider = provider;
  notification.providerResponse = response.data;

  return { ok: true, provider, notificationId: notification.id, response: response.data };
}

async function notifyWhatsapp(input, options = {}) {
  const notification = createNotification(input);
  const delivery = await dispatchWhatsapp(notification, options);
  return { notification, delivery };
}

function registerWhatsappReply(rawBody = {}) {
  const text = String(rawBody.text || rawBody.message || rawBody.body || '').trim();
  const from = rawBody.phone || rawBody.from || rawBody.sender || 'desconhecido';
  const reply = {
    id: `wpr_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    receivedAt: nowIso(),
    from,
    text,
    rawBody,
    interpretedAction: interpretReply(text),
  };
  whatsappReplies.unshift(reply);
  return reply;
}

function interpretReply(text = '') {
  const clean = String(text).trim().toLowerCase();
  if (clean === '1' || clean.includes('pausar') || clean.includes('desativar')) return 'pause_or_disable';
  if (clean === '2' || clean.includes('teste') || clean.includes('isolada')) return 'create_test_campaign';
  if (clean === '3' || clean.includes('manter') || clean.includes('reativar')) return 'keep_running';
  return 'unknown';
}

module.exports = {
  createNotification,
  listNotifications,
  listWhatsappReplies,
  notifyWhatsapp,
  registerWhatsappReply,
  interpretReply,
  formatWhatsappMessage,
};
