'use strict';

module.exports = function(session) {
  const redisStore = require('connect-redis')(session);
  return new redisStore({
    client: process.env.REDIS_URL
  });
};
