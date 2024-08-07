// Broken import of workers: https://github.com/ryanclark/karma-webpack/issues/498

const path = require('path');
const { buildConfig, tsConfig } = require('../../../webpack/configs');
const {
    setupKarmaEnv,
    getKarmaConfigPart,
    getKarmaWebpackConfigPart,
} = require('../../../test/karma.utils');

setupKarmaEnv();

module.exports = function (config) {
    const webpackConfig = buildConfig(
        [tsConfig(['charter'], () => path.resolve(__dirname)), getKarmaWebpackConfigPart()],
        false,
    );
    const karmaPart = getKarmaConfigPart(webpackConfig, __dirname);

    config.set(karmaPart);
};
