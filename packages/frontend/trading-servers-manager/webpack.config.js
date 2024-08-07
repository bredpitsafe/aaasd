const { defaultAppConfig } = require('../../../webpack/configs.js');
const { buildConfig } = require('../../../webpack/configs');
const devPorts = require('../../../webpack/devPorts.json');
const path = require('path');

module.exports = buildConfig([
    defaultAppConfig(['trading-servers-manager'], () => path.resolve(__dirname)),
    {
        devServer: { port: devPorts.TRADING_SERVERS_MANAGER },
    },
]);
