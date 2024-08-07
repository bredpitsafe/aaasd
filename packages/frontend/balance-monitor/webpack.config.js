const { defaultAppConfig } = require('../../../webpack/configs.js');
const { buildConfig } = require('../../../webpack/configs');
const devPorts = require('../../../webpack/devPorts.json');
const path = require('path');

module.exports = buildConfig([
    defaultAppConfig(['balance-monitor'], () => path.resolve(__dirname)),
    {
        devServer: { port: devPorts.BALANCE_MONITOR },
    },
]);
