const {
    buildConfig,
    htmlConfig,
    defaultInOut,
    defaultDevServerConfig,
} = require('../../../webpack/configs');
const path = require('path');

const app = 'index';
const resolvePath = () => path.resolve(__dirname);

module.exports = buildConfig([
    defaultInOut([app], resolvePath),
    htmlConfig([app], resolvePath),
    defaultDevServerConfig(app),
]);
