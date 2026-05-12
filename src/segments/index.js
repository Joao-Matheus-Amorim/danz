const { odontologiaAdapter } = require('./odontologia');
const { genericAdapter } = require('./generic');

const adapters = new Map([
  [odontologiaAdapter.segment, odontologiaAdapter],
]);

function getSegmentAdapter(segment) {
  return adapters.get(segment) || genericAdapter;
}

module.exports = {
  getSegmentAdapter,
  odontologiaAdapter,
  genericAdapter,
};
