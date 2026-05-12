module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/domain/**/*.js',
    'src/services/metaAds.js',
    '!**/node_modules/**',
  ],
};
