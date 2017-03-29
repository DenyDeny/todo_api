'use strict';
const express = require('express');
const router = express.Router();
const User = require('../../models/user').User;
const HttpError = require('../../libs/errGen').HttpError;
const errors = require('../../libs/errors');
const validator = require('../../libs/validationSchema');

router.post('/find_by_email', (req, res, next) => {
  req.check({
    'email': {
      in: 'body',
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    }
  });

  req.getValidationResult().then(vRes => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
      }
    const email = req.body.email;
    User.findOne({email: email}, (err, user) => {
      if (err || !user) {
        return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
      }
      let foundUser = {
        email: user.email,
        photo: user.photo
      };
      res.status(200).send(foundUser);
    });
    });
});

router.post('/login', (req, res, next) => {
  req.check(validator.loginSchema);

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }
    const email = req.body.email;
    const password = req.body.password;

    User.authorize(email, password, (err, user) => {
      if (err || !user) {
        return next(new HttpError({status: 500, message: err.message}));
      }
      req.session.user = user._id;

      const newSession = {
        os: req.body.session.os,
        type: req.body.session.type,
        browser: req.body.session.browser,
        sessionId: req.session.id
      };

      User.createSession(newSession, req.session.user, (sessionErr, session) => {
        if (sessionErr || !session) {
          return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
        }
        let sendData = {
          user: {
            name: user.name,
            email: user.email,
            _id: user._id
          },
          session: session
        };
        res.json(sendData);
      });
    });
  });
});

router.post('/logout', (req, res, next) => {
  User.removeSession(req.session.user, req.session.id, function (rmErr) {
    if (rmErr) {
      return next(new HttpError(errors.DB_ERR));
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(new HttpError(errors.SERVER_ERR));
      }
      res.status(200).send();
    });
  });
});

router.post('/register', (req, res, next) => {
  req.check(validator.loginSchema);

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }

    User.register(req.body, (err, user) => {
      if (err || !user) {
        return next(new HttpError({status: 500, message: err.message}));
      }
      req.session.user = user._id;
      const newSession = {
        os: req.body.session.os,
        type: req.body.session.type,
        browser: req.body.session.browser,
        sessionId: req.session.id
      };
      User.createSession(newSession, req.session.user, (err, session) => {
        if (err) {
          return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
        }
        let sendData = {
          user: {
            name: user.name,
            email: user.email,
            _id: user._id
          },
          session: session
        };
        res.json(sendData);
      });
    })
  });
});

module.exports = router;
