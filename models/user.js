'use strict';
const mongoose = require('../libs/mongoose');
const crypto = require('crypto-js');
const async = require('async');
const moment = require('moment');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: String,
  done: {
    type: Boolean,
    default: false
  },
  end: {
    type: Date,
    default: moment().format()
  }
});

const sessionSchema = new Schema({
  type: String,
  os: String,
  browser: String,
  sessionId: String
});

const userSchema = new Schema({
  email: String,
  hashedPassword: String,
  key: String,
  name: String,
  birthday: Date,
  photo: String,

  sessions: [sessionSchema],
  tasks: [taskSchema]
});

userSchema.methods.encryptPassword = function (password) {
  return crypto.HmacSHA1(password, this.key).toString();
};

userSchema.virtual('password')
  .set(function (password) {
    this.key = Math.random().toString(36).substring(7);
    this.hashedPassword = this.encryptPassword(password, this.key);
  });

userSchema.methods.checkPassword = function (password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

userSchema.statics.removeSession = function (userId, sessionId, reqSession, callback) {
  const User = this;
  User.findById(userId, (err, user) => {
    if (err || !user) {
      return callback(err);
    }
    let session = user.sessions.id(sessionId);
    if (reqSession.id === session.sessionId) {
      reqSession.destroy();
    }
    session.remove();
    user.save((err, updUser) => {
      if (err) {
        return callback(err);
      }
      callback(null, updUser, session.sessionId)
    });
  })
};

userSchema.statics.register = function (newUserInfo, callback) {
  const User = this;
  async.waterfall([
    (callback) => {
      User.findOne({email: newUserInfo.email}, callback);
    },
    (user, callback) => {
      if (user) {
        callback({message: 'Email is exist'});
      } else {
        const newUser = new User({
          email: newUserInfo.email,
          password: newUserInfo.password
        });
        newUser.save(function (err, newUser) {
          if (err) {
            return callback(err);
          }
          callback(null, newUser);
        });
      }
    }
  ], callback)
};

userSchema.statics.authorize = function (email, password, callback) {
  const User = this;

  async.waterfall([
    function (callback) {
      User.findOne({email: email}, callback);
    },
    function (user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          callback({message: 'Wrong email or password'});
        }
      } else {
        callback({message: 'User not found'});
      }
    }], callback);
};

userSchema.statics.createSession = function (sessionInfo, userId, callback) {
  const User = this;

  User.findById(userId, (err, user) => {
    if (err) {
      return callback(err);
    }
    user.sessions.push(sessionInfo);
    user.save((err, result) => {
      if (err) {
        return callback(err);
      }
      let createdSession = result.sessions[result.sessions.length - 1];
      callback(null, createdSession);
    });
  })
};

exports.User = mongoose.model('User', userSchema);
