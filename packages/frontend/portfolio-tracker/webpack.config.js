const { defaultAppConfig } = require('../../../webpack/configs.js');
const { buildConfig } = require('../../../webpack/configs');
const devPorts = require('../../../webpack/devPorts.json');
const path = require('path');

module.exports = buildConfig([
    defaultAppConfig(['portfolio-tracker'], () => path.resolve(__dirname)),
    {
        devServer: { port: devPorts.PORTFOLIO_TRACKER },
    },
]);
