module.exports = {
  loginSchema: {
    'email': {
      in: 'body',
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    },
    'password': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid Email',
      isLength: {
        options: [{min: 6, max: 12}],
        errorMessage: 'Must be between 6 and 12 chars long'
      }
    },
    'session': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid Session data'
    },
    'session.type': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid Session data'
    },
    'session.os': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid Session data'
    },
    'session.browser': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Invalid Session data'
    }
  },
  taskSchema: {
    'title': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Title required'
    },
    'done': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Done value required'
    },
    'end': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'End date required'
    }
  },
  userInfoSchema: {
    'name': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'User name is required'
    },
    'birthday': {
      in: 'body',
      notEmpty: true,
      errorMessage: 'User birthday is required'
    }
  }
};