const generateCommonConfig = require('./generateCommonConfig');

module.exports = generateCommonConfig('(src|test/e2e)/.*\.(e2e-)?spec\.ts$', true);
