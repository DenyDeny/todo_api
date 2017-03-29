module.exports = {
  AUTH_ERR: {
    status: 403,
    message: 'Wrong email or password'
  },
  DB_ERR: {
    status: 500,
    message: 'DB error'
  },
  BAD_REQ: function (info) {
    return {
      status: 400,
      message: JSON.stringify(info)
    }
  },
  INVALID_USER_ID: {
    status: 400,
    message: 'User not found'
  },
  SERVER_ERR: {
    status: 500,
    message: 'Server error'
  }
};