'use strict';

const HttpError = require('../libs/errGen').HttpError;
const errors = require('../libs/errors');

module.exports = function (req, res, next) {
  console.log(req.cookies);
  if (!req.session.user) {
    return next(new HttpError(errors.AUTH_ERR));
  }
  next();
};
