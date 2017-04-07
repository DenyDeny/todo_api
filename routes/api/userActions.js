'use strict';
const express = require('express');
const router = express.Router();
const User = require('../../models/user').User;
const HttpError = require('../../libs/errGen').HttpError;
const errors = require('../../libs/errors');
const validator = require('../../libs/validationSchema');

router.post('/update_user_info', (req, res, next) => {
  req.check(validator.userInfoSchema);

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }
    const user = req.body;
    /*todo convert date to valid format*/
    User.findOneAndUpdate(
      {
        _id: req.session.user
      },
      {
        name: user.name,
        birthday: user.birthday,
        photo: user.photo
      },
      {
        new: true
      }, (err, updated) => {
        if (err || !updated) {
          return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
        }
        res.status(200).json({
          name: updated.name,
          birthday: updated.birthday,
          photo: updated.photo
        });
      });
  });
});

router.get('/get_user_info', (req, res, next) => {
  User.findById(req.session.user, (err, user) => {
      if (err || !user) {
        return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
      }
      let userInfo = {
        user: {
          _id: user._id,
          name: user.name,
          birthday: user.birthday,
          photo: user.photo,
        },
        sessions: user.sessions,
        tasks: user.tasks
      };
      res.json(userInfo);
    })
});

router.get('/terminate_user_session', (req, res, next) => {
    if (!req.query.id) {
      return next(new HttpError(errors.BAD_REQ('missing id in request')));
    }

    User.removeSession(req.session.user, req.query.id, req.session, function (rmErr, rmRes) {
      if (rmErr) {
        return next(new HttpError(errors.DB_ERR));
      }
      req.sessionStore.destroy(req.query.id, (desErr) => {
        if (desErr) {
          return next(new HttpError(errors.SERVER_ERR));
        }
        res.status(200).json(rmRes.sessions);
      });
    });
});

module.exports = router;
