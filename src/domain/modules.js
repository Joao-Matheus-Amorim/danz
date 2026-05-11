const KNOWN_MODULES = [
  'pullMetaMetrics',
  'fillDentalSheet',
  'fillSheet',
  'sendWhatsappReport',
  'analyzeCreatives',
  'checkBalance',
  'uploadCreative',
  'createCampaign',
  'createAdset',
  'pauseAds',
  'createTestCampaign',
];

function hasModule(clientOrGroup, moduleName) {
  if (!clientOrGroup || clientOrGroup.enabled === false) return false;
  return clientOrGroup.modules?.[moduleName] === true;
}

function mergeModules(...moduleSets) {
  return Object.assign({}, ...moduleSets.filter(Boolean));
}

function unknownModules(modules = {}) {
  return Object.keys(modules).filter((key) => !KNOWN_MODULES.includes(key));
}

module.exports = {
  KNOWN_MODULES,
  hasModule,
  mergeModules,
  unknownModules,
};
