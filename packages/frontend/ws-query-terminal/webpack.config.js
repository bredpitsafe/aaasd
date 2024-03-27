const path = require('path');
const { defaultAppConfig } = require('../../../webpack/configs.js');
const { buildConfig } = require('../../../webpack/configs');
const devPorts = require('../../../webpack/devPorts.json');

module.exports = buildConfig([
    defaultAppConfig(['ws-query-terminal'], () => path.resolve(__dirname)),
    {
        devServer: { port: devPorts.WS_QUERY_TERMINAL },
    },
]);
