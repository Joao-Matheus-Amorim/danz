jest.mock('axios', () => ({
  request: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const axios = require('axios');
const { MetaAdsClient, isRetriableStatus, isRetriableError } = require('../metaAds');

describe('MetaAdsClient security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sends token using Authorization Bearer header, not query params', async () => {
    axios.request.mockResolvedValueOnce({ data: { id: '123', name: 'Test User' } });

    const client = new MetaAdsClient({ accessToken: 'secret-token', dryRun: false, maxRetries: 0 });
    const result = await client.validateToken();

    expect(result.name).toBe('Test User');
    expect(axios.request).toHaveBeenCalledTimes(1);

    const requestConfig = axios.request.mock.calls[0][0];
    expect(requestConfig.headers).toEqual({ Authorization: 'Bearer secret-token' });
    expect(requestConfig.params).toEqual({ fields: 'id,name' });
    expect(requestConfig.params.access_token).toBeUndefined();
  });

  test('identifies retriable statuses', () => {
    expect(isRetriableStatus(408)).toBe(true);
    expect(isRetriableStatus(429)).toBe(true);
    expect(isRetriableStatus(500)).toBe(true);
    expect(isRetriableStatus(503)).toBe(true);
    expect(isRetriableStatus(400)).toBe(false);
    expect(isRetriableStatus(401)).toBe(false);
  });

  test('identifies timeout and 429 errors as retriable', () => {
    expect(isRetriableError({ code: 'ETIMEDOUT' })).toBe(true);
    expect(isRetriableError({ code: 'ECONNABORTED' })).toBe(true);
    expect(isRetriableError({ response: { status: 429 } })).toBe(true);
    expect(isRetriableError({ response: { status: 401 } })).toBe(false);
  });
});
