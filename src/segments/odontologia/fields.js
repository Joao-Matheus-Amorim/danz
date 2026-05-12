const ALLOWED_FIELDS = new Set(['leads', 'value', 'cpl']);
const DEFAULT_FIELDS = ['leads', 'value'];

function sheetRef(sheetName, cell) {
  return sheetName ? `'${sheetName}'!${cell}` : cell;
}

function valueForEmptyMode(value, emptyMode) {
  if (emptyMode === 'blank' && Number(value) === 0) return '';
  return value;
}

function parseFields(fields = DEFAULT_FIELDS.join(',')) {
  const parsed = String(fields || DEFAULT_FIELDS.join(','))
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  const invalid = parsed.filter((field) => !ALLOWED_FIELDS.has(field));
  if (invalid.length) throw new Error(`Campos inválidos: ${invalid.join(', ')}. Use: leads,value,cpl.`);
  return parsed.length ? parsed : [...DEFAULT_FIELDS];
}

function buildFieldUpdates({ unit, sheetName, row, total, selectedFields }) {
  const updates = [];
  const valuesByField = {
    leads: total.leads,
    value: total.value,
    cpl: total.leads > 0 ? total.value / total.leads : '',
  };

  for (const field of selectedFields) {
    const column = unit.columns[field];
    if (!column) continue;
    updates.push({
      range: sheetRef(sheetName, `${column}${row}`),
      values: [[valueForEmptyMode(valuesByField[field], unit.emptyMode)]],
    });
  }

  return updates;
}

module.exports = {
  ALLOWED_FIELDS,
  DEFAULT_FIELDS,
  sheetRef,
  valueForEmptyMode,
  parseFields,
  buildFieldUpdates,
};
