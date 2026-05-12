let selectedCampaignId = null;
let lastAnalysisData = null;

function analysisText(value) {
  return String(value || '').toLowerCase().trim();
}

function entityId(entity) {
  return entity?.id || entity?.campaignId || entity?.adsetId || entity?.name || '';
}

function sameCampaign(adsetOrCreative, campaign) {
  if (adsetOrCreative.campaignId && campaign.id) return adsetOrCreative.campaignId === campaign.id;
  return analysisText(adsetOrCreative.campaign || adsetOrCreative.campaignName) === analysisText(campaign.name);
}

function sameAdset(creative, adset) {
  if (creative.adsetId && adset.id) return creative.adsetId === adset.id;
  return analysisText(creative.adset || creative.adsetName) === analysisText(adset.name);
}

function renderMetric(label, value) {
  return `<div class="analysis-metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function adsetsForCampaign(data, campaign) {
  return (data.adsets || []).filter((adset) => sameCampaign(adset, campaign));
}

function creativesForAdset(data, adset) {
  return (data.creatives || []).filter((creative) => sameAdset(creative, adset));
}

function creativesForCampaign(data, campaign) {
  return (data.creatives || []).filter((creative) => sameCampaign(creative, campaign));
}

function renderCampaignTree(data) {
  lastAnalysisData = data;
  const campaigns = data.campaigns || [];
  if (!selectedCampaignId && campaigns[0]) selectedCampaignId = entityId(campaigns[0]);
  if (!campaigns.some((campaign) => entityId(campaign) === selectedCampaignId)) selectedCampaignId = entityId(campaigns[0]) || null;

  if (campaignTreeCount) campaignTreeCount.textContent = String(campaigns.length);
  if (campaignTreeList) {
    campaignTreeList.innerHTML = campaigns.length ? campaigns.map((campaign) => {
      const adsets = adsetsForCampaign(data, campaign);
      const creatives = creativesForCampaign(data, campaign);
      const id = entityId(campaign);
      const active = id === selectedCampaignId ? 'active' : '';
      return `
        <button class="analysis-item ${active}" onclick="selectCampaign('${encodeURIComponent(id)}')">
          <strong>${escapeHtml(campaign.name)}</strong>
          <small>${escapeHtml(campaign.client || data.name || 'Cliente')} · ${escapeHtml(campaign.objective || 'objetivo não informado')}</small>
          <div class="analysis-metrics">
            ${renderMetric('Gasto', money(campaign.spend))}
            ${renderMetric('Leads', num(campaign.leads))}
            ${renderMetric('CPL', money(campaign.cpl))}
            ${renderMetric('Conjuntos', adsets.length)}
          </div>
          <small>${creatives.length} criativo(s) vinculados · ID ${escapeHtml(campaign.id || '-')}</small>
        </button>
      `;
    }).join('') : '<div class="analysis-empty">Nenhuma campanha encontrada.</div>';
  }

  renderCampaignDetail(data, selectedCampaignId);
}

function selectCampaign(encodedId) {
  selectedCampaignId = decodeURIComponent(encodedId);
  if (lastAnalysisData) renderCampaignTree(lastAnalysisData);
}

function renderCampaignDetail(data, campaignId) {
  if (!campaignTreeDetail) return;
  const campaign = (data.campaigns || []).find((item) => entityId(item) === campaignId);
  if (!campaign) {
    campaignTreeDetail.innerHTML = '<div class="analysis-empty">Selecione uma campanha para ver conjuntos e criativos.</div>';
    return;
  }

  const adsets = adsetsForCampaign(data, campaign);
  const looseCreatives = creativesForCampaign(data, campaign).filter((creative) => !adsets.some((adset) => sameAdset(creative, adset)));

  campaignTreeDetail.innerHTML = `
    <div class="analysis-headline">
      <div>
        <h3>${escapeHtml(campaign.name)}</h3>
        <p>${escapeHtml(campaign.client || data.name || 'Cliente')} · ${escapeHtml(campaign.objective || 'objetivo não informado')} · ${escapeHtml(campaign.status || 'status')} · ID ${escapeHtml(campaign.id || '-')}</p>
      </div>
      <span class="pill">${adsets.length} conjunto(s)</span>
    </div>
    <div class="analysis-metrics">
      ${renderMetric('Gasto', money(campaign.spend))}
      ${renderMetric('Leads', num(campaign.leads))}
      ${renderMetric('CPL', money(campaign.cpl))}
      ${renderMetric('ROI', `${num(campaign.roi)}x`)}
    </div>
    <div class="analysis-nested">
      ${adsets.length ? adsets.map((adset) => renderAdsetCard(data, adset)).join('') : '<div class="analysis-empty">Nenhum conjunto vinculado a esta campanha.</div>'}
      ${looseCreatives.length ? renderLooseCreatives(looseCreatives) : ''}
    </div>
  `;
}

function renderAdsetCard(data, adset) {
  const creatives = creativesForAdset(data, adset);
  return `
    <div class="adset-card">
      <div class="analysis-headline">
        <div>
          <h4>${escapeHtml(adset.name)}</h4>
          <p>${escapeHtml(adset.status || 'status')} · campanha: ${escapeHtml(adset.campaignName || adset.campaign || '-')} · ID ${escapeHtml(adset.id || '-')}</p>
        </div>
        <span class="pill">${creatives.length} criativo(s)</span>
      </div>
      <div class="analysis-metrics">
        ${renderMetric('Gasto', money(adset.spend))}
        ${renderMetric('Leads', num(adset.leads))}
        ${renderMetric('CPL', money(adset.cpl))}
        ${renderMetric('CTR', pct(adset.ctr))}
      </div>
      <div class="creative-grid">
        ${creatives.length ? creatives.map(renderCreativeMini).join('') : '<div class="analysis-empty">Nenhum criativo vinculado a este conjunto.</div>'}
      </div>
    </div>
  `;
}

function renderLooseCreatives(creatives) {
  return `
    <div class="adset-card">
      <div class="analysis-headline">
        <div>
          <h4>Criativos sem conjunto encontrado</h4>
          <p>Esses criativos estão ligados à campanha por ID/nome, mas o conjunto não apareceu na base atual.</p>
        </div>
        <span class="pill">${creatives.length} criativo(s)</span>
      </div>
      <div class="creative-grid">${creatives.map(renderCreativeMini).join('')}</div>
    </div>
  `;
}

function renderCreativeMini(creative) {
  return `
    <div class="creative-mini">
      <strong>${escapeHtml(creative.name)}</strong>
      <p>${escapeHtml(creative.status || 'status')} · ${escapeHtml(creative.recommendation || 'sem recomendação')} · ID ${escapeHtml(creative.id || '-')}</p>
      <div class="analysis-metrics">
        ${renderMetric('Gasto', money(creative.spend))}
        ${renderMetric('Leads', num(creative.leads))}
        ${renderMetric('CPL', creative.cpl ? money(creative.cpl) : '-')}
        ${renderMetric('CTR', pct(creative.ctr))}
      </div>
    </div>
  `;
}

async function bootstrapCampaignTree() {
  if (!window.campaignTreeList || typeof api !== 'function') return;
  const data = await api('/api/dashboard?client=all');
  renderCampaignTree(data);
}

window.renderCampaignTree = renderCampaignTree;
window.selectCampaign = selectCampaign;
bootstrapCampaignTree();
