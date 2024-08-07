require('dotenv').config();

const devPorts = require('./webpack/devPorts.json');
const path = require('path');
const fs = require('fs');
const { buildConfig, defaultAppConfig } = require('./webpack/configs');

const apps = process.env.app
    ? process.env.app.split(',')
    : [
          'index',
          'dashboard',
          'trading-servers-manager',
          'herodotus-terminal',
          'herodotus-trades',
          'backtesting',
          'trading-stats',
          'balance-monitor',
          'charter-debugger',
          'ws-query-terminal',
          'authz',
      ];

console.log(`=== APPS: ${apps.join(', ')} ===`);

const config = buildConfig([defaultAppConfig(apps)]);

function ifExists(filePath) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    return fs.existsSync(absPath) ? absPath : undefined;
}

// When exporting multiple configurations only the devServer options for the first configuration
// will be taken into account and used for all the configurations in the array.
// @see https://webpack.js.org/configuration/dev-server/
config.devServer = {
    client: { overlay: false },
    hot: false,
    port: process.env.DEV_SERVER_PORT || devPorts.DEFAULT,
    server: {
        type: 'https',
        options: {
            key: ifExists(process.env.DEV_SERVER_SSL_KEY || './cert/localhost-key.pem'),
            cert: ifExists(process.env.DEV_SERVER_SSL_CERT || './cert/localhost.pem'),
        },
    },
    historyApiFallback: {
        rewrites: apps.map((app) => ({
            from: new RegExp(`^\/${app}`),
            to: `/${app}.html`,
        })),
    },
};

module.exports = config;
