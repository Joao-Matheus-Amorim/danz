const { odontologiaAdapter } = require('../odontologia');

const genericAdapter = {
  ...odontologiaAdapter,
  segment: 'generic',
};

module.exports = {
  genericAdapter,
};
