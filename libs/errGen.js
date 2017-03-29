'use strict';
const util = require('util');
const http = require('http');

function HttpError(err) {
  let status = err.status;
  let message = err.message;
  Error.apply(this, [status, message]);
  Error.captureStackTrace(this, HttpError);

  this.status = status;
  this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

exports.HttpError = HttpError;
