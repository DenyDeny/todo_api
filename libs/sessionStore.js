'use strict';
const config = require('config');
const redis = require('redis');
const redisConf = config.get('redis');
const url = require('url');

function createClient (port, host, options) {
  let client;

  if(process.env.REDISTOGO_URL) {
    const redisUrl = url.parse(process.env.REDISTOGO_URL);
    client = redis.createClient(redisUrl.port, redisUrl.hostname, options);
    client.auth(redisUrl.auth.split(':')[1]);
  } else {
    client = redis.createClient(port, host, options);
  }

  return client;
}

module.exports = function (session) {
  const redisStore = require('connect-redis')(session);

  return new redisStore({client: createClient(redisConf.port, redisConf.host)});
};
