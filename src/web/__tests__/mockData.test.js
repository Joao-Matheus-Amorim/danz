const { getClient, consolidated, normalizeClientData } = require('../mockData');

describe('mockData normalization', () => {
  test('normalizes adsets and creatives with campaign/adset ids', () => {
    const client = getClient('dental');

    expect(client.campaigns[0]).toMatchObject({
      id: 'cmp_dental_001',
      campaignId: 'cmp_dental_001',
      campaignName: 'Dental | Implantes | Maio',
    });

    expect(client.adsets[0]).toMatchObject({
      id: 'ads_dental_001',
      campaignId: 'cmp_dental_001',
      campaignName: 'Dental | Implantes | Maio',
    });

    expect(client.creatives[0]).toMatchObject({
      id: 'ad_dental_001',
      campaignId: 'cmp_dental_001',
      campaignName: 'Dental | Implantes | Maio',
      adsetId: 'ads_dental_001',
      adsetName: 'Público raio 8km | 25-55',
    });
  });

  test('keeps name fallback when ids are missing', () => {
    const normalized = normalizeClientData({
      key: 'mock',
      name: 'Mock',
      summary: {},
      campaigns: [{ id: 'cmp_1', name: 'Campanha A' }],
      adsets: [{ id: 'ads_1', campaign: 'Campanha A', name: 'Conjunto A' }],
      creatives: [{ id: 'ad_1', campaign: 'Campanha A', adset: 'Conjunto A', name: 'Criativo A' }],
      alerts: [],
    });

    expect(normalized.adsets[0].campaignId).toBe('cmp_1');
    expect(normalized.creatives[0].campaignId).toBe('cmp_1');
    expect(normalized.creatives[0].adsetId).toBe('ads_1');
  });

  test('consolidated data preserves client metadata and normalized relations', () => {
    const data = consolidated();
    const creative = data.creatives.find((item) => item.id === 'ad_ot2_002');

    expect(creative).toMatchObject({
      client: 'Ótica 2',
      clientKey: 'otica2',
      campaignId: 'cmp_ot2_002',
      adsetId: 'ads_ot2_002',
    });
  });
});
