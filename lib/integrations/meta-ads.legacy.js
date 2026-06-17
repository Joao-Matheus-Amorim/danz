const axios = require('axios');
const { logger } = require('../utils/logger');
const { normalizeInsight } = require('../domain/metrics');

function isCliDryRun() {
  return process.argv.includes('--dry-run');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function isRetriableError(error) {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
  const status = error.response?.status;
  return isRetriableStatus(status);
}

function safeMetaMessage(error) {
  const metaError = error.response?.data?.error;
  return metaError?.message || error.message || 'Erro desconhecido na Meta API';
}

class MetaAdsClient {
  constructor({
    accessToken = process.env.META_ACCESS_TOKEN,
    version = process.env.META_API_VERSION || 'v19.0',
    dryRun = isCliDryRun(),
    timeoutMs = Number(process.env.META_TIMEOUT_MS || 30000),
    maxRetries = Number(process.env.META_MAX_RETRIES || 2),
    retryBaseDelayMs = Number(process.env.META_RETRY_BASE_DELAY_MS || 800),
  } = {}) {
    this.dryRun = dryRun;
    this.accessToken = accessToken;
    this.version = version;
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
    this.retryBaseDelayMs = retryBaseDelayMs;
    this.baseUrl = `https://graph.facebook.com/${version}`;

    if (!this.accessToken && !this.dryRun) {
      throw new Error('META_ACCESS_TOKEN não configurado. Crie um arquivo .env baseado no .env.example.');
    }

    if (this.dryRun) {
      logger.warn('[DRY RUN] Meta API será simulada. Nenhuma chamada real será feita.');
    }
  }

  getAuthHeaders() {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  async request(path, params = {}, method = 'GET') {
    if (this.dryRun) {
      logger.info(`[DRY RUN] Meta API simulada: ${method} ${path}`);
      return { data: [], paging: null };
    }

    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const response = await axios.request({
          url,
          method,
          params,
          headers: this.getAuthHeaders(),
          timeout: this.timeoutMs,
        });
        return response.data;
      } catch (error) {
        lastError = error;
        const message = safeMetaMessage(error);
        const status = error.response?.status;
        const canRetry = attempt < this.maxRetries && isRetriableError(error);

        logger.warn(`Meta API falhou em ${path}${status ? ` | status ${status}` : ''}: ${message}${canRetry ? ' | retry agendado' : ''}`);

        if (!canRetry) break;
        const delay = this.retryBaseDelayMs * 2 ** attempt;
        await sleep(delay);
      }
    }

    throw new Error(safeMetaMessage(lastError));
  }

  async validateToken() {
    if (this.dryRun) {
      return { id: 'dry-run', name: 'Meta API simulada' };
    }
    const me = await this.request('/me', { fields: 'id,name' });
    return me;
  }

  async getAdAccount(adAccountId) {
    if (this.dryRun) {
      return {
        id: adAccountId,
        name: 'Conta simulada',
        account_status: 1,
        currency: 'BRL',
        balance: 0,
        amount_spent: 0,
        spend_cap: 0,
      };
    }

    return this.request(`/${adAccountId}`, {
      fields: 'id,name,account_status,currency,balance,amount_spent,spend_cap',
    });
  }

  async getBalance(adAccountId) {
    const account = await this.getAdAccount(adAccountId);
    return {
      id: account.id,
      name: account.name,
      status: account.account_status,
      currency: account.currency || 'BRL',
      balance: Number(account.balance || 0) / 100,
      amountSpent: Number(account.amount_spent || 0) / 100,
      spendCap: Number(account.spend_cap || 0) / 100,
    };
  }

  async getInsights({ client, level, since, until }) {
    if (this.dryRun) {
      logger.info(`[DRY RUN] Retornando insights vazios para ${client.name} | nível ${level} | ${since} até ${until}`);
      return [];
    }

    const fields = [
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_id',
      'ad_name',
      'spend',
      'impressions',
      'clicks',
      'inline_link_clicks',
      'ctr',
      'cpc',
      'cpm',
      'actions',
      'action_values',
      'account_currency',
      'date_start',
      'date_stop',
    ].join(',');

    const all = [];
    let after = null;

    do {
      const data = await this.request(`/${client.adAccountId}/insights`, {
        level,
        fields,
        time_range: JSON.stringify({ since, until }),
        limit: 500,
        after,
      });
      all.push(...(data.data || []));
      after = data.paging?.cursors?.after || null;
      if (!data.paging?.next) after = null;
    } while (after);

    return all.map((raw) => normalizeInsight(raw, { client, level }));
  }
}

module.exports = {
  MetaAdsClient,
  isRetriableStatus,
  isRetriableError,
  safeMetaMessage,
};
