require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { listClients, getClient, consolidated } = require('./mockData');

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

function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return sendJson(res, { ok: true, service: 'trafego-automator', mode: process.env.NODE_ENV || 'development' });
  }

  if (url.pathname === '/api/clients') {
    return sendJson(res, listClients());
  }

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

  if (url.pathname === '/api/actions/pause-creative' && req.method === 'POST') {
    return sendJson(res, {
      ok: true,
      dryRun: true,
      message: 'Ação simulada. Com AUTO_PAUSE_ENABLED=true e token real, este endpoint pausará o criativo na Meta.',
    });
  }

  if (url.pathname === '/api/actions/test-campaign' && req.method === 'POST') {
    return sendJson(res, {
      ok: true,
      dryRun: true,
      message: 'Ação simulada. Com credenciais reais, este endpoint cria campanha pausada de teste isolado.',
    });
  }

  const filePath = url.pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, url.pathname.replace(/^\//, ''));
  return sendFile(res, filePath, contentTypeFor(filePath));
}

const server = http.createServer((req, res) => {
  try {
    router(req, res);
  } catch (error) {
    sendJson(res, { ok: false, error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Dashboard rodando em http://localhost:${PORT}`);
});
