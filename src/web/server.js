require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { listClients, getClient, consolidated } = require('./mockData');
const { notifyWhatsapp, listNotifications } = require('../services/notificationCenter');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '../../public');

function sendJson(res, payload, status = 200) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (_) { resolve({ raw: body }); }
    });
  });
}

function sendFile(res, filePath, contentType = 'text/html; charset=utf-8') {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function contentTypeFor(filePath) {
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'text/html; charset=utf-8';
}

async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return sendJson(res, { ok: true, service: 'trafego-automator', mode: process.env.NODE_ENV || 'development' });
  }

  if (url.pathname === '/api/clients') return sendJson(res, listClients());

  if (url.pathname === '/api/dashboard') {
    const client = url.searchParams.get('client') || 'all';
    return sendJson(res, client === 'all' ? consolidated() : getClient(client));
  }

  if (url.pathname === '/api/campaigns') {
    const client = url.searchParams.get('client') || 'all';
    const data = client === 'all' ? consolidated() : getClient(client);
    return sendJson(res, data.campaigns || []);
  }

  if (url.pathname === '/api/adsets') {
    const client = url.searchParams.get('client') || 'all';
    const data = client === 'all' ? consolidated() : getClient(client);
    return sendJson(res, data.adsets || []);
  }

  if (url.pathname === '/api/creatives') {
    const client = url.searchParams.get('client') || 'all';
    const data = client === 'all' ? consolidated() : getClient(client);
    return sendJson(res, data.creatives || []);
  }

  if (url.pathname === '/api/alerts') {
    const client = url.searchParams.get('client') || 'all';
    const data = client === 'all' ? consolidated() : getClient(client);
    return sendJson(res, data.alerts || []);
  }

  if (url.pathname === '/api/notifications') {
    return sendJson(res, listNotifications());
  }

  if (url.pathname === '/api/alerts/send-demo' && req.method === 'POST') {
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
    return sendJson(res, result);
  }

  if (url.pathname === '/api/actions/pause-creative' && req.method === 'POST') {
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
    return sendJson(res, { ok: true, dryRun: true, result });
  }

  if (url.pathname === '/api/actions/test-campaign' && req.method === 'POST') {
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
    return sendJson(res, { ok: true, dryRun: true, result });
  }

  const filePath = url.pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, url.pathname.replace(/^\//, ''));
  return sendFile(res, filePath, contentTypeFor(filePath));
}

const server = http.createServer((req, res) => {
  router(req, res).catch((error) => sendJson(res, { ok: false, error: error.message }, 500));
});

server.listen(PORT, () => {
  console.log(`Dashboard rodando em http://localhost:${PORT}`);
});
