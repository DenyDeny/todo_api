'use strict';
const express = require('express');
const router = express.Router();
const checkAuth = require('./../middleware/checkAuth');
const user = require('./api/user');
const userActions = require('./api/userActions');
const task = require('./api/task');

router.use('/user', user);
router.use('/user_actions', checkAuth, userActions);
router.use('/task', checkAuth, task);

module.exports = router;
