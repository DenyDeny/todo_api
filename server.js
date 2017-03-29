'use strict';
const express = require('express');
const api = require('./routes/api');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('config');
const logger = require('morgan');
const session = require('express-session');
const sessionStore = require('./libs/sessionStore')(session);
const HttpError = require('./libs/errGen').HttpError;
const errors = require('./libs/errors');
const errorhandler = require('errorhandler');
const expressValidator = require('express-validator');
const cors = require('cors');
const app = express();


app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
}));



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(expressValidator({}));

app.use(session({
	secret: config.get('session.secret'),
	key: config.get('session.key'),
	cookie: config.get('session.cookie'),
	store: sessionStore,
	resave: false,
	saveUninitialized: true
}));

app.use((req, res, next) => {
  req.sessionStore = sessionStore;
  next();
});

app.use(require('./middleware/sendHttpError'));

app.use('/api', api);

app.get('/test/path', function (req, res) {
  req.sessionStore.all((err, data) => {
    res.json(data);
  })
});

app.get('/redis_store', function (req, res) {
  req.sessionStore.all((err, data) => {
    data.forEach(item => {
      req.sessionStore.destroy(item.id, (err) => {})
    });
    res.json(data);
  })
});

// catch 404
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res) {
  if (typeof err === 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
      app.use(errorhandler())
    } else {
      err = new HttpError(errors.SERVER_ERR);
      res.sendHttpError(err);
    }
  }
});

app.listen(3000, function () {
	console.log('http://localhost:3000');
});
