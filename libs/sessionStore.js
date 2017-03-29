'use strict';
const config = require('config');
const redisConf = config.get('redis');

module.exports = function(session) {
  const redisStore = require('connect-redis')(session);
  return new redisStore({
    host: redisConf.host,
    port: redisConf.port
  });
};
