const path = require('path');
const { defaultAppConfig } = require('../../../webpack/configs.js');
const { buildConfig } = require('../../../webpack/configs');
const devPorts = require('../../../webpack/devPorts.json');

module.exports = buildConfig([
    defaultAppConfig(['authz'], () => path.resolve(__dirname)),
    {
        devServer: { port: devPorts.AUTHZ },
    },
]);
