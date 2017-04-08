'use strict';

const express = require('express');
const router = express.Router();
const User = require('../../models/user').User;
const HttpError = require('../../libs/errGen').HttpError;
const errors = require('../../libs/errors');
const validator = require('./../../libs/validationSchema');

/*function filterTasks(tasks, callback) {

  let incompleteTasks = tasks.filter(item => {
    return item.done === false;
  });
  let completedTasks = tasks.filter(item => {
    return item.done === true;
  });

  callback({
    incompleteTasks,
    completedTasks
  })
}*/

router.get('/list', (req, res, next) => {
	User.findById(req.session.user, (err, user) => {
    if (err || !user) {
      return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
    }
    res.json(user.tasks);
	})
});

router.post('/create_task', (req, res, next) => {
  req.check(validator.taskSchema);

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }
    const newTask = req.body;

    User.findById(req.session.user, (err, user) => {
      if (err || !user) {
        return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
      }
      user.tasks.push(newTask);
      user.save((err, result) => {
        if (err) {
          return next(new HttpError(errors.DB_ERR));
        }
        let createdTask = result.tasks[result.tasks.length - 1];
        res.json(createdTask);
      });
    })
  });
});

router.post('/update_task', (req, res, next) => {
  req.check(validator.taskSchema);
  req.check({
    '_id': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Task ID is Required'
    }
  });

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }
    const task = req.body;

    User.findOneAndUpdate(
      {
        _id: req.session.user,
        'tasks._id': task._id
      },
      {
        'tasks.$.title': task.title,
        'tasks.$.done': task.done,
        'tasks.$.end': task.end
      },
      {
        new: true
      }, (err, updated) => {
        if (err || !updated) {
          return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
        }
        let updatedTask = updated.tasks.id(task._id);
        if (!updatedTask) {
          return next(new HttpError(errors.DB_ERR));
        }
        res.status(200).json(updatedTask);
      });
  });
});

router.delete('/delete_task', (req, res, next) => {
  req.check({
    'id': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Task ID is Required'
    }
  });

  req.getValidationResult().then((vRes) => {
    if (!vRes.isEmpty()) {
      let errInfo = vRes.mapped();
      return next(new HttpError(errors.BAD_REQ(errInfo)));
    }

    User.findById(req.session.user, (err, user) => {
      if (err || !user) {
        return next(new HttpError(!err ? errors.INVALID_USER_ID : errors.DB_ERR));
      }
      let task = user.tasks.id(req.body.id);
      if (!task) {
        return next(new HttpError(errors.DB_ERR));
      }
      task.remove();
      user.save((err) => {
        if (err) {
          return next(new HttpError(errors.DB_ERR));
        }
        User.findById(req.session.user, (resErr, resUser) => {
          if (resErr || !resUser) {
            return next(new HttpError(!resErr ? errors.INVALID_USER_ID : errors.DB_ERR));
          }
          res.status(200).json(resUser.tasks);
        })
      });
    })
  });
});

module.exports = router;
