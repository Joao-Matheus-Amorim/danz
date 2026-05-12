const campaignMatcher = require('./campaignMatcher');
const fields = require('./fields');

const odontologiaAdapter = {
  segment: 'odontologia',
  defaultModule: 'fillDentalSheet',
  allowedFields: [...fields.ALLOWED_FIELDS],
  defaultFields: [...fields.DEFAULT_FIELDS],
  matchMetricToUnit: campaignMatcher.matchMetricToUnit,
  filterRowsForUnit: campaignMatcher.filterRowsForUnit,
  parseFields: fields.parseFields,
  buildFieldUpdates: fields.buildFieldUpdates,
};

module.exports = {
  odontologiaAdapter,
  ...campaignMatcher,
  ...fields,
};
