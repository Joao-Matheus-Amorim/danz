export interface MetaAdAccountBalance {
  id: string;
  name: string;
  status: number;
  currency: string;
  balance: number;
  amountSpent: number;
  spendCap: number;
}

export interface MetaInsight {
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetName: string;
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
  inlineLinkClicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  currency: string;
  dateStart: string;
  dateStop: string;
}

interface MetaApiResponse<T> {
  data: T;
  paging?: { cursors?: { after?: string }; next?: string };
}

function isRetriableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MetaAdsClient {
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;

  constructor(accessToken: string, version = "v19.0") {
    if (!accessToken) {
      throw new Error("META_ACCESS_TOKEN nao configurado.");
    }
    this.accessToken = accessToken;
    this.baseUrl = `https://graph.facebook.com/${version}`;
    this.timeoutMs = Number(process.env.META_TIMEOUT_MS || 30000);
    this.maxRetries = Number(process.env.META_MAX_RETRIES || 2);
    this.retryBaseDelayMs = Number(process.env.META_RETRY_BASE_DELAY_MS || 800);
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) query.set(key, String(value));
    }

    const url = `${this.baseUrl}/${path.replace(/^\//, "")}?${query.toString()}`;
    let lastError: Error = new Error("Erro desconhecido na Meta API");

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error?.message || `Meta API respondeu ${response.status}`;
          const canRetry = attempt < this.maxRetries && isRetriableStatus(response.status);
          lastError = new Error(message);
          if (!canRetry) throw lastError;
          await sleep(this.retryBaseDelayMs * 2 ** attempt);
          continue;
        }

        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          lastError = new Error("Meta API: tempo limite excedido.");
        } else if (error instanceof Error) {
          lastError = error;
        }
        if (attempt >= this.maxRetries) throw lastError;
        await sleep(this.retryBaseDelayMs * 2 ** attempt);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError;
  }

  async validateAdAccount(adAccountId: string): Promise<{ id: string; name: string }> {
    const account = await this.request<{ id: string; name: string }>(`/${adAccountId}`, {
      fields: "id,name",
    });
    return account;
  }

  async getBalance(adAccountId: string): Promise<MetaAdAccountBalance> {
    const account = await this.request<{
      id: string;
      name: string;
      account_status: number;
      currency: string;
      balance: string;
      amount_spent: string;
      spend_cap: string;
    }>(`/${adAccountId}`, {
      fields: "id,name,account_status,currency,balance,amount_spent,spend_cap",
    });

    return {
      id: account.id,
      name: account.name,
      status: account.account_status,
      currency: account.currency || "BRL",
      balance: Number(account.balance || 0) / 100,
      amountSpent: Number(account.amount_spent || 0) / 100,
      spendCap: Number(account.spend_cap || 0) / 100,
    };
  }

  async getInsights(
    adAccountId: string,
    level: "campaign" | "adset" | "ad",
    since: string,
    until: string
  ): Promise<MetaInsight[]> {
    const fields = [
      "campaign_id",
      "campaign_name",
      "adset_id",
      "adset_name",
      "ad_id",
      "ad_name",
      "spend",
      "impressions",
      "clicks",
      "inline_link_clicks",
      "ctr",
      "cpc",
      "cpm",
      "account_currency",
      "date_start",
      "date_stop",
    ].join(",");

    const all: Record<string, string>[] = [];
    let after: string | undefined;

    do {
      const data = await this.request<MetaApiResponse<Record<string, string>[]>>(
        `/${adAccountId}/insights`,
        {
          level,
          fields,
          time_range: JSON.stringify({ since, until }),
          limit: 500,
          after,
        }
      );
      all.push(...(data.data || []));
      after = data.paging?.cursors?.after;
      if (!data.paging?.next) after = undefined;
    } while (after);

    return all.map((raw) => ({
      campaignId: raw.campaign_id,
      campaignName: raw.campaign_name,
      adsetId: raw.adset_id,
      adsetName: raw.adset_name,
      adId: raw.ad_id,
      adName: raw.ad_name,
      spend: Number(raw.spend || 0),
      impressions: Number(raw.impressions || 0),
      clicks: Number(raw.clicks || 0),
      inlineLinkClicks: Number(raw.inline_link_clicks || 0),
      ctr: Number(raw.ctr || 0),
      cpc: Number(raw.cpc || 0),
      cpm: Number(raw.cpm || 0),
      currency: raw.account_currency || "BRL",
      dateStart: raw.date_start,
      dateStop: raw.date_stop,
    }));
  }
}
