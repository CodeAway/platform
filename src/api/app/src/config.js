require('babel-polyfill');
const hasuraConfig = require('../hasuraconfig');

const host = hasuraConfig.appHost;
const port = hasuraConfig.port[process.env.NODE_ENV || 'development'];

const environment = {
  development: {
    isProduction: false,
  },
  production: {
    isProduction: true,
  },
}[process.env.NODE_ENV || 'development'];


module.exports = Object.assign({
  host,
  port,
  app: {title: 'IMAD API server'}
}, environment);
