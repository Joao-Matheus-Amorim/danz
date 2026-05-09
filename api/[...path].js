const { listClients, getClient, consolidated } = require('../src/web/mockData');
const { notifyWhatsapp, listNotifications } = require('../src/services/notificationCenter');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (_) { resolve({ raw: body }); }
    });
  });
}

module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const path = url.pathname;

    if (path === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'trafego-automator', runtime: 'vercel-serverless' });
    }

    if (path === '/api/clients') return sendJson(res, 200, listClients());

    if (path === '/api/dashboard') {
      const client = url.searchParams.get('client') || 'all';
      return sendJson(res, 200, client === 'all' ? consolidated() : getClient(client));
    }

    if (path === '/api/campaigns') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.campaigns || []);
    }

    if (path === '/api/adsets') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.adsets || []);
    }

    if (path === '/api/creatives') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.creatives || []);
    }

    if (path === '/api/alerts') {
      const client = url.searchParams.get('client') || 'all';
      const data = client === 'all' ? consolidated() : getClient(client);
      return sendJson(res, 200, data.alerts || []);
    }

    if (path === '/api/notifications') {
      return sendJson(res, 200, listNotifications());
    }

    if (path === '/api/alerts/send-demo' && req.method === 'POST') {
      const body = await readBody(req);
      const result = await notifyWhatsapp({
        client: body.client || 'Ótica 2',
        type: body.type || 'SEM_LEAD_COM_GASTO',
        severity: body.severity || 'critical',
        title: body.title || '🚨 Alerta em tempo real',
        message: body.message || 'Criativo gastou verba sem gerar leads. O sistema recomenda pausar ou testar isolado.',
        action: body.action || '1 pausar | 2 testar isolado | 3 manter rodando',
        payload: body.payload || { creativeId: 'ad_demo' },
      }, { dryRun: true });
      return sendJson(res, 200, result);
    }

    if (path === '/api/actions/pause-creative' && req.method === 'POST') {
      const body = await readBody(req);
      const result = await notifyWhatsapp({
        client: body.client || 'Sistema',
        type: 'ACTION_PAUSE_CREATIVE',
        severity: 'warning',
        title: '⏸️ Pausa simulada de criativo',
        message: `Pedido de pausa registrado para ${body.creativeId || 'criativo selecionado'}.`,
        action: 'No modo real, chama a Meta API.',
        payload: body,
      }, { dryRun: true });
      return sendJson(res, 200, { ok: true, dryRun: true, result });
    }

    if (path === '/api/actions/test-campaign' && req.method === 'POST') {
      const body = await readBody(req);
      const result = await notifyWhatsapp({
        client: body.client || 'Sistema',
        type: 'ACTION_CREATE_TEST_CAMPAIGN',
        severity: 'info',
        title: '🧪 Campanha teste simulada',
        message: `Pedido de campanha isolada registrado para ${body.creativeId || 'criativo selecionado'}.`,
        action: 'No modo real, cria campanha pausada de teste.',
        payload: body,
      }, { dryRun: true });
      return sendJson(res, 200, { ok: true, dryRun: true, result });
    }

    return sendJson(res, 404, { ok: false, error: 'Endpoint não encontrado', path });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message });
  }
};
