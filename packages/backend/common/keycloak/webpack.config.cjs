const defaultNodeConfig = require('../../../../webpack/node.js');
const app = require('./package.json');

module.exports = defaultNodeConfig(app.name);
