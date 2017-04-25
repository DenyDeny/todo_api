'use strict';
const config = require('config');
const redisConf = config.get('redis');

module.exports = function (session) {
  const redisStore = require('connect-redis')(session);

  const connectConfig = process.env.NODE_ENV === 'production'
    ? { client: process.env.REDIS_URL }
    : { host: redisConf.host, port: redisConf.port };

  return new redisStore(connectConfig);
};
