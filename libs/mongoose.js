'use strict';
const mongoose = require('mongoose');
const config = require('config');
const dbConf = config.get('mongoose');

mongoose.connect(dbConf.uri);

module.exports = mongoose;
