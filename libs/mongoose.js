'use strict';
const mongoose = require('mongoose');
const config = require('config');
const dbConf = config.get('mongoose');

const connectConfig = process.env.NODE_ENV === 'production'
  ? process.env.MONGODB_URI
  : dbConf.uri;

mongoose.connect( connectConfig );

module.exports = mongoose;
