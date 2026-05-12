const dashboardData = {
  dental: {
    key: 'dental',
    name: 'Dental Lead',
    mode: 'sheet_only',
    summary: {
      spend: 3240.75,
      leads: 176,
      cpl: 18.41,
      ctr: 3.7,
      roi: 4.2,
      totalValue: 13680,
      balance: 820.5,
      status: 'operacional',
    },
    campaigns: [
      { id: 'cmp_dental_001', name: 'Dental | Implantes | Maio', objective: 'LEAD_GENERATION', spend: 1280.4, leads: 74, cpl: 17.3, ctr: 4.1, roi: 4.8, status: 'ACTIVE' },
      { id: 'cmp_dental_002', name: 'Dental | Clareamento | Maio', objective: 'LEAD_GENERATION', spend: 920.2, leads: 46, cpl: 20.0, ctr: 3.2, roi: 3.6, status: 'ACTIVE' },
      { id: 'cmp_dental_003', name: 'Dental | Avaliação grátis', objective: 'LEAD_GENERATION', spend: 1040.15, leads: 56, cpl: 18.57, ctr: 3.8, roi: 4.1, status: 'ACTIVE' },
    ],
    adsets: [
      { id: 'ads_dental_001', campaign: 'Dental | Implantes | Maio', name: 'Público raio 8km | 25-55', spend: 760.1, leads: 48, cpl: 15.84, ctr: 4.8, status: 'ACTIVE' },
      { id: 'ads_dental_002', campaign: 'Dental | Implantes | Maio', name: 'Interesses saúde bucal', spend: 520.3, leads: 26, cpl: 20.01, ctr: 3.5, status: 'ACTIVE' },
      { id: 'ads_dental_003', campaign: 'Dental | Clareamento | Maio', name: 'Lookalike leads 1%', spend: 920.2, leads: 46, cpl: 20.0, ctr: 3.2, status: 'ACTIVE' },
    ],
    creatives: [
      { id: 'ad_dental_001', campaign: 'Dental | Implantes | Maio', adset: 'Público raio 8km | 25-55', name: 'IMG_001_sorriso_implante', spend: 390.1, leads: 31, cpl: 12.58, ctr: 5.2, status: 'DESTAQUE', recommendation: 'Escalar ou testar isolado' },
      { id: 'ad_dental_002', campaign: 'Dental | Implantes | Maio', adset: 'Público raio 8km | 25-55', name: 'VIDEO_002_depoimento', spend: 260.4, leads: 13, cpl: 20.03, ctr: 3.9, status: 'OK', recommendation: 'Manter rodando' },
      { id: 'ad_dental_003', campaign: 'Dental | Clareamento | Maio', adset: 'Lookalike leads 1%', name: 'IMG_003_preco_clareamento', spend: 188.8, leads: 4, cpl: 47.2, ctr: 1.1, status: 'CPL_ALTO', recommendation: 'Pausar e revisar oferta/criativo' },
    ],
    alerts: [
      { type: 'CPL_ALTO', severity: 'critical', message: 'Criativo IMG_003_preco_clareamento com CPL R$47,20 acima do limite configurado.', action: 'Pausar ou testar nova copy' },
      { type: 'DESTAQUE', severity: 'success', message: 'Criativo IMG_001_sorriso_implante está performando acima da média.', action: 'Criar teste isolado' },
    ],
  },
  otica1: {
    key: 'otica1',
    name: 'Ótica 1',
    mode: 'meta_full',
    summary: {
      spend: 1840.2,
      leads: 92,
      cpl: 20.0,
      ctr: 3.4,
      roi: 3.1,
      totalValue: 5700,
      balance: 260.0,
      status: 'atenção',
    },
    campaigns: [
      { id: 'cmp_ot1_001', name: 'Ótica 1 | Multifocal | Maio', objective: 'LEAD_GENERATION', spend: 980.1, leads: 55, cpl: 17.82, ctr: 3.9, roi: 3.8, status: 'ACTIVE' },
      { id: 'cmp_ot1_002', name: 'Ótica 1 | Armações | Maio', objective: 'LEAD_GENERATION', spend: 860.1, leads: 37, cpl: 23.25, ctr: 2.7, roi: 2.4, status: 'ACTIVE' },
    ],
    adsets: [
      { id: 'ads_ot1_001', campaign: 'Ótica 1 | Multifocal | Maio', name: 'Raio loja | 35-60', spend: 610.0, leads: 40, cpl: 15.25, ctr: 4.2, status: 'ACTIVE' },
      { id: 'ads_ot1_002', campaign: 'Ótica 1 | Armações | Maio', name: 'Promoção armações', spend: 860.1, leads: 37, cpl: 23.25, ctr: 2.7, status: 'ACTIVE' },
    ],
    creatives: [
      { id: 'ad_ot1_001', campaign: 'Ótica 1 | Multifocal | Maio', adset: 'Raio loja | 35-60', name: 'VIDEO_multifocal_cliente', spend: 420.2, leads: 32, cpl: 13.13, ctr: 4.9, status: 'DESTAQUE', recommendation: 'Escalar verba controlada' },
      { id: 'ad_ot1_002', campaign: 'Ótica 1 | Armações | Maio', adset: 'Promoção armações', name: 'IMG_armacao_preco', spend: 190.0, leads: 3, cpl: 63.33, ctr: 0.8, status: 'CPL_ALTO', recommendation: 'Pausar e trocar criativo' },
    ],
    alerts: [
      { type: 'SALDO_BAIXO', severity: 'warning', message: 'Saldo da Ótica 1 chegando perto do limite configurado.', action: 'Recarregar conta' },
      { type: 'CPL_ALTO', severity: 'critical', message: 'Criativo IMG_armacao_preco com CPL R$63,33.', action: 'Pausar ou refazer criativo' },
    ],
  },
  otica2: {
    key: 'otica2',
    name: 'Ótica 2',
    mode: 'meta_full',
    summary: {
      spend: 1420.0,
      leads: 68,
      cpl: 20.88,
      ctr: 2.9,
      roi: 2.8,
      totalValue: 3980,
      balance: 180.0,
      status: 'saldo baixo',
    },
    campaigns: [
      { id: 'cmp_ot2_001', name: 'Ótica 2 | Consulta visual', objective: 'LEAD_GENERATION', spend: 760.0, leads: 41, cpl: 18.54, ctr: 3.2, roi: 3.2, status: 'ACTIVE' },
      { id: 'cmp_ot2_002', name: 'Ótica 2 | Lentes premium', objective: 'LEAD_GENERATION', spend: 660.0, leads: 27, cpl: 24.44, ctr: 2.4, roi: 2.3, status: 'ACTIVE' },
    ],
    adsets: [
      { id: 'ads_ot2_001', campaign: 'Ótica 2 | Consulta visual', name: 'Raio loja | WhatsApp', spend: 760.0, leads: 41, cpl: 18.54, ctr: 3.2, status: 'ACTIVE' },
      { id: 'ads_ot2_002', campaign: 'Ótica 2 | Lentes premium', name: 'Interesse lentes', spend: 660.0, leads: 27, cpl: 24.44, ctr: 2.4, status: 'ACTIVE' },
    ],
    creatives: [
      { id: 'ad_ot2_001', campaign: 'Ótica 2 | Consulta visual', adset: 'Raio loja | WhatsApp', name: 'IMG_consulta_gratis', spend: 350.0, leads: 25, cpl: 14.0, ctr: 3.8, status: 'DESTAQUE', recommendation: 'Criar campanha isolada de teste' },
      { id: 'ad_ot2_002', campaign: 'Ótica 2 | Lentes premium', adset: 'Interesse lentes', name: 'VIDEO_lentes_premium', spend: 140.0, leads: 0, cpl: 0, ctr: 1.0, status: 'SEM_LEAD_COM_GASTO', recommendation: 'Pausar automaticamente e revisar público' },
    ],
    alerts: [
      { type: 'SALDO_BAIXO', severity: 'critical', message: 'Saldo Ótica 2 em R$180, abaixo do limite recomendado.', action: 'Recarregar conta' },
      { type: 'SEM_LEAD_COM_GASTO', severity: 'critical', message: 'Criativo VIDEO_lentes_premium gastou R$140 sem gerar leads.', action: 'Pausar e decidir no WhatsApp' },
    ],
  },
};

function sameName(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function normalizeClientData(client) {
  const campaigns = (client.campaigns || []).map((campaign) => ({
    ...campaign,
    campaignId: campaign.id,
    campaignName: campaign.name,
  }));

  const adsets = (client.adsets || []).map((adset) => {
    const campaign = campaigns.find((item) => item.id === adset.campaignId || sameName(item.name, adset.campaign));
    return {
      ...adset,
      campaignId: adset.campaignId || campaign?.id || null,
      campaignName: adset.campaignName || campaign?.name || adset.campaign || null,
      campaign: adset.campaign || campaign?.name || adset.campaignName || null,
    };
  });

  const creatives = (client.creatives || []).map((creative) => {
    const campaign = campaigns.find((item) => item.id === creative.campaignId || sameName(item.name, creative.campaign));
    const adset = adsets.find((item) => item.id === creative.adsetId || sameName(item.name, creative.adset));
    return {
      ...creative,
      campaignId: creative.campaignId || campaign?.id || adset?.campaignId || null,
      campaignName: creative.campaignName || campaign?.name || creative.campaign || adset?.campaignName || null,
      campaign: creative.campaign || campaign?.name || adset?.campaignName || null,
      adsetId: creative.adsetId || adset?.id || null,
      adsetName: creative.adsetName || adset?.name || creative.adset || null,
      adset: creative.adset || adset?.name || creative.adsetName || null,
    };
  });

  return {
    ...client,
    campaigns,
    adsets,
    creatives,
  };
}

function listClients() {
  return Object.values(dashboardData).map(({ key, name, mode, summary }) => ({ key, name, mode, summary }));
}

function getClient(key = 'dental') {
  return normalizeClientData(dashboardData[key] || dashboardData.dental);
}

function consolidated() {
  const clients = Object.values(dashboardData).map(normalizeClientData);
  const summary = clients.reduce((acc, client) => {
    acc.spend += client.summary.spend;
    acc.leads += client.summary.leads;
    acc.totalValue += client.summary.totalValue;
    return acc;
  }, { spend: 0, leads: 0, totalValue: 0 });

  summary.cpl = summary.leads > 0 ? summary.spend / summary.leads : 0;
  summary.ctr = 3.3;
  summary.roi = summary.spend > 0 ? summary.totalValue / summary.spend : 0;

  return {
    key: 'all',
    name: 'Visão consolidada',
    summary,
    campaigns: clients.flatMap((client) => client.campaigns.map((item) => ({ ...item, client: client.name, clientKey: client.key }))),
    adsets: clients.flatMap((client) => client.adsets.map((item) => ({ ...item, client: client.name, clientKey: client.key }))),
    creatives: clients.flatMap((client) => client.creatives.map((item) => ({ ...item, client: client.name, clientKey: client.key }))),
    alerts: clients.flatMap((client) => client.alerts.map((item) => ({ ...item, client: client.name, clientKey: client.key }))),
  };
}

module.exports = { dashboardData, listClients, getClient, consolidated, normalizeClientData };
