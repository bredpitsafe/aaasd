const {
    htmlConfig,
    wasmConfig,
    tsConfig,
    buildConfig,
    defaultInOut,
    contextConfig,
} = require('../../../webpack/configs');
const path = require('path');
const devPorts = require('../../../webpack/devPorts.json');

const app = 'charter-debugger';
const resolvePath = () => path.resolve(__dirname);

module.exports = buildConfig([
    contextConfig(__dirname),
    defaultInOut([app], resolvePath),
    tsConfig([app], resolvePath),
    wasmConfig,
    htmlConfig([app], resolvePath),
    {
        devServer: {
            port: devPorts.CHARTER_DEBUGGER,
        },
    },
]);
