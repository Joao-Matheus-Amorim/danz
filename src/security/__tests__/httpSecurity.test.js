const {
  validateTaskRunBody,
  validateAlertDemoBody,
  validateActionBody,
  checkRateLimit,
} = require('../httpSecurity');

function mockReq(ip = '127.0.0.1') {
  return {
    headers: {},
    socket: { remoteAddress: ip },
  };
}

describe('httpSecurity validators', () => {
  test('validateTaskRunBody accepts known task keys', () => {
    expect(validateTaskRunBody({ taskKey: 'full_cycle', real: false }).ok).toBe(true);
    expect(validateTaskRunBody({ taskKey: 'pull_meta_ads', real: true }).ok).toBe(true);
  });

  test('validateTaskRunBody rejects unknown task keys and bad booleans', () => {
    const result = validateTaskRunBody({ taskKey: 'rm_rf', real: 'yes' });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('taskKey inválido');
    expect(result.errors.join(' ')).toContain('real deve ser boolean');
  });

  test('validateAlertDemoBody rejects malformed fields', () => {
    const result = validateAlertDemoBody({ message: 123, payload: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('message deve ser string');
    expect(result.errors.join(' ')).toContain('payload deve ser objeto');
  });

  test('validateActionBody accepts basic action payload', () => {
    expect(validateActionBody({ client: 'Sistema', creativeId: 'ad_123' }).ok).toBe(true);
  });

  test('checkRateLimit blocks after max requests in window', () => {
    const req = mockReq('10.0.0.1');
    expect(checkRateLimit(req, { scope: 'test_scope', max: 1, windowMs: 10000 }).allowed).toBe(true);
    expect(checkRateLimit(req, { scope: 'test_scope', max: 1, windowMs: 10000 }).allowed).toBe(false);
  });
});
