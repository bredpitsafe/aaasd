// Broken import of workers: https://github.com/ryanclark/karma-webpack/issues/498

const path = require('path');
const os = require('os');
const isCI = require('is-ci');

const getKarmaWebpackConfigPart = () => {
    return {
        output: {
            path: path.join(os.tmpdir(), '_karma_webpack_') + Math.floor(Math.random() * 1000000),
        },
        module: {
            // skip error with circular errors inside MOCHA!
            exprContextCritical: false,
        },
    };
};

const setupKarmaEnv = () => {
    if (isCI) {
        process.env.CHROME_BIN = require('puppeteer').executablePath();
    }
};

const getKarmaConfigPart = (webpackConfig) => {
    return {
        plugins: ['karma-webpack', 'karma-mocha', 'karma-mocha-reporter', 'karma-chrome-launcher'],

        frameworks: ['webpack', 'mocha'],

        files: [
            { pattern: './**/lib/**/*.test.browser.ts', watched: false },
            { pattern: './**/src/**/*.test.browser.ts', watched: false },
            {
                pattern: `${webpackConfig.output.path}/*.test.browser.js`,
                watched: false,
                included: false,
            },
        ],

        preprocessors: {
            '**/*.ts': ['webpack'],
        },

        reporters: ['mocha'],

        browsers: [isCI ? 'BrowserCI' : 'BrowserDev'],

        customLaunchers: {
            BrowserCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox'],
            },
            BrowserDev: {
                base: 'ChromeHeadless',
            },
        },

        webpack: webpackConfig,
    };
};

module.exports = {
    setupKarmaEnv,
    getKarmaConfigPart,
    getKarmaWebpackConfigPart,
};
