const rateLimitBuckets = new Map();

const DEFAULT_ALLOWED_TASKS = new Set([
  'full_cycle',
  'pull_meta_ads',
  'analyze_performance',
  'fill_sheets',
  'check_balance',
  'send_whatsapp_alerts',
  'suggest_actions',
]);

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"
  );
}

function clientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) return forwardedFor.split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

function rateLimitKey(req, scope = 'global') {
  return `${scope}:${clientIp(req)}`;
}

function checkRateLimit(req, {
  scope = 'global',
  max = Number(process.env.RATE_LIMIT_MAX || 120),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
} = {}) {
  const now = Date.now();
  const key = rateLimitKey(req, scope);
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (current.count >= max) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(max - current.count, 0), resetAt: current.resetAt };
}

function enforceRateLimit(req, res, options = {}) {
  const result = checkRateLimit(req, options);
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
  if (result.allowed) return true;

  res.statusCode = 429;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: false, error: 'Rate limit excedido. Tente novamente mais tarde.' }));
  return false;
}

function bearerToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return req.headers['x-admin-token'] || req.headers['x-api-token'] || '';
}

function requireOperationalAuth(req, res) {
  const configuredToken = process.env.OPERATIONAL_API_TOKEN || process.env.ADMIN_API_TOKEN;

  if (!configuredToken) {
    const allowDev = process.env.NODE_ENV !== 'production' && process.env.ALLOW_UNAUTHENTICATED_DEV_TASKS === 'true';
    if (allowDev) return true;

    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: false,
      error: 'OPERATIONAL_API_TOKEN não configurado. Endpoint operacional bloqueado por segurança.',
    }));
    return false;
  }

  if (bearerToken(req) === configuredToken) return true;

  res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: false, error: 'Não autorizado.' }));
  return false;
}

function ensureObject(body) {
  return body && typeof body === 'object' && !Array.isArray(body) && !body.raw;
}

function validateTaskRunBody(body = {}) {
  const errors = [];
  if (!ensureObject(body)) errors.push('body deve ser JSON válido');

  if (body.taskKey !== undefined) {
    if (typeof body.taskKey !== 'string') errors.push('taskKey deve ser string');
    if (typeof body.taskKey === 'string' && !DEFAULT_ALLOWED_TASKS.has(body.taskKey)) {
      errors.push(`taskKey inválido: ${body.taskKey}`);
    }
  }

  if (body.real !== undefined && typeof body.real !== 'boolean') errors.push('real deve ser boolean');

  return { ok: errors.length === 0, errors };
}

function validateAlertDemoBody(body = {}) {
  const errors = [];
  if (!ensureObject(body)) errors.push('body deve ser JSON válido');

  for (const field of ['client', 'type', 'severity', 'title', 'message', 'action']) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`${field} deve ser string`);
    }
  }

  if (body.message !== undefined && body.message.length > 1500) errors.push('message deve ter no máximo 1500 caracteres');
  if (body.payload !== undefined && (typeof body.payload !== 'object' || Array.isArray(body.payload))) {
    errors.push('payload deve ser objeto');
  }

  return { ok: errors.length === 0, errors };
}

function validateActionBody(body = {}) {
  const errors = [];
  if (!ensureObject(body)) errors.push('body deve ser JSON válido');
  if (body.creativeId !== undefined && typeof body.creativeId !== 'string') errors.push('creativeId deve ser string');
  if (body.client !== undefined && typeof body.client !== 'string') errors.push('client deve ser string');
  return { ok: errors.length === 0, errors };
}

function validationError(res, errors) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: false, error: 'Payload inválido.', details: errors }));
}

module.exports = {
  setSecurityHeaders,
  enforceRateLimit,
  requireOperationalAuth,
  validateTaskRunBody,
  validateAlertDemoBody,
  validateActionBody,
  validationError,
  checkRateLimit,
};
