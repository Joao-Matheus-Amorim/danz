function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchMetricToUnit(row, unit) {
  const match = unit.campaignMatch || {};
  const target = normalizeText(row.campanha || row.campaign_name || row.campaign_id || '');

  if (Array.isArray(match.ids) && match.ids.length > 0) {
    return match.ids.includes(row.campaign_id);
  }

  if (Array.isArray(match.exact) && match.exact.length > 0) {
    return match.exact.some((item) => target === normalizeText(item));
  }

  if (Array.isArray(match.contains) && match.contains.length > 0) {
    return match.contains.some((item) => target.includes(normalizeText(item)));
  }

  return false;
}

function filterRowsForUnit(rows = [], unit) {
  if (unit.meta?.mode !== 'shared_ad_account') return rows;
  return rows.filter((row) => matchMetricToUnit(row, unit));
}

module.exports = {
  normalizeText,
  matchMetricToUnit,
  filterRowsForUnit,
};
