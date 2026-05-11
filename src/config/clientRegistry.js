const fs = require('fs');
const path = require('path');
const { deriveUnitColumns } = require('../utils/sheetsColumns');
const { unknownModules } = require('../domain/modules');

const CLIENTS_DIR = path.join(__dirname, '../../data/clients');

function walkJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkJsonFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
  }

  return files;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeUnit(group, unit, index) {
  const columns = unit.columns || deriveUnitColumns(group.columnLayout, index);
  const meta = { ...(group.meta || {}), ...(unit.meta || {}) };
  const sharedAccountId = meta.adAccountId || group.adAccountId || null;
  const unitAdAccountId = unit.adAccountId || sharedAccountId;

  return {
    ...unit,
    groupKey: `${group.companyId}:${group.state}:${unit.key}`,
    companyId: group.companyId,
    companyName: group.companyName,
    group: group.group,
    segment: group.segment,
    state: group.state,
    spreadsheetId: unit.spreadsheetId || group.spreadsheetId,
    sheetName: unit.sheetName || group.sheetName,
    rowOffset: Number(unit.rowOffset || group.rowOffset || 2),
    emptyMode: unit.emptyMode || group.emptyMode || 'zero',
    modules: { ...(group.modules || {}), ...(unit.modules || {}) },
    rules: { ...(group.rules || {}), ...(unit.rules || {}) },
    whatsapp: { ...(group.whatsapp || {}), ...(unit.whatsapp || {}) },
    meta,
    adAccountId: unitAdAccountId,
    sharedAdAccountId: sharedAccountId,
    campaignMatch: unit.campaignMatch || unit.match || null,
    columns,
  };
}

function normalizeGroup(group, sourcePath) {
  const units = (group.units || []).map((unit, index) => normalizeUnit(group, unit, index));
  return { ...group, sourcePath, units };
}

function loadClientGroups() {
  return walkJsonFiles(CLIENTS_DIR).map((filePath) => normalizeGroup(readJson(filePath), filePath));
}

function loadUnits() {
  return loadClientGroups().flatMap((group) => group.units);
}

function matches(value, expected) {
  if (!expected || expected === 'all' || expected === 'todos') return true;
  return String(value || '').toLowerCase() === String(expected).toLowerCase();
}

function filterUnits(units, scope = {}) {
  return units.filter((unit) => {
    if (!matches(unit.companyId, scope.company)) return false;
    if (!matches(unit.group, scope.group)) return false;
    if (!matches(unit.segment, scope.segment)) return false;
    if (!matches(unit.state, scope.state)) return false;
    if (!matches(unit.city, scope.city)) return false;
    if (scope.module && unit.modules?.[scope.module] !== true) return false;
    if (scope.enabled === true && unit.enabled === false) return false;
    return true;
  });
}

function validateAdAccount(adAccountId) {
  const value = String(adAccountId || '').trim();
  if (!value) return 'adAccountId vazio';
  if (value.includes('PREENCHER')) return 'adAccountId pendente';
  if (!/^act_\d{6,}$/.test(value)) return 'adAccountId deve seguir formato act_123456';
  return null;
}

function validateUnit(unit) {
  const errors = [];
  if (!unit.key) errors.push('key obrigatória');
  if (!unit.name) errors.push('name obrigatório');
  if (!unit.companyId) errors.push('companyId obrigatório');
  if (!unit.group) errors.push('group obrigatório');
  if (!unit.segment) errors.push('segment obrigatório');
  if (!unit.state) errors.push('state obrigatório');
  if (!unit.spreadsheetId) errors.push('spreadsheetId obrigatório');
  if (!unit.sheetName) errors.push('sheetName obrigatório');
  if (!unit.columns?.leads) errors.push('columns.leads obrigatório');
  if (!unit.columns?.value) errors.push('columns.value obrigatório');

  const adAccountError = validateAdAccount(unit.adAccountId);
  if (adAccountError) errors.push(adAccountError);

  if (unit.meta?.mode === 'shared_ad_account' && !unit.campaignMatch) {
    errors.push('campaignMatch obrigatório para conta Meta compartilhada');
  }

  const unknown = unknownModules(unit.modules || {});
  if (unknown.length) errors.push(`módulos desconhecidos: ${unknown.join(', ')}`);

  return { ok: errors.length === 0, unit, errors };
}

function validateRegistry(scope = {}) {
  const units = filterUnits(loadUnits(), scope);
  const results = units.map(validateUnit);
  return {
    ok: results.every((result) => result.ok),
    total: results.length,
    valid: results.filter((result) => result.ok).length,
    invalid: results.filter((result) => !result.ok).length,
    results,
  };
}

module.exports = {
  loadClientGroups,
  loadUnits,
  filterUnits,
  validateUnit,
  validateRegistry,
  validateAdAccount,
};
