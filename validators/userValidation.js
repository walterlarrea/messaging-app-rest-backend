import { checkSchema } from "express-validator"

const userValiation = checkSchema({
  email: {
    isEmail: {
      errorMessage: 'Must be a valid e-mail address',
    },
    notEmpty: {
      errorMessage: 'An e-mail is required',
    },
    isLength: {
      options: { max: 60 },
      errorMessage: 'Maximum of 60 characters',
    },
  },
  username: {
    notEmpty: {
      errorMessage: 'An username is required',
    },
    isLength: {
      options: { min: 5, max: 25 },
      errorMessage: 'Must have between 5 and 25 characters',
    },
    errorMessage: 'Invalid username',
  },
  name: {
    notEmpty: {
      errorMessage: 'A name is required',
    },
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage: 'Must have between 3 and 20 characters',
    },
    errorMessage: 'Invalid name',
  },
  last_name: {
    optional: true,
    isLength: {
      options: { min: 3, max: 25 },
      errorMessage: 'Must have between 3 and 25 characters',
    },
  },
  password: {
    notEmpty: {
      errorMessage: 'A password is required',
    },
    isLength: {
      options: { min: 8, max: 30 },
      errorMessage: 'Must have between 8 and 30 characters',
    },
    errorMessage: 'Invalid password',
  },
  password_confirm: {
    notEmpty: {
      errorMessage: 'A password confirmation is required',
    },
    custom: {
      options: (value, { req }) => value === req.body.password,
      errorMessage: 'Passwords don\'t match',
    }
  },
  user_type: {
    optional: true,
    isIn: ['user', 'administrator', 'manager'],
    errorMessage: 'Must be one of user, administrator, or manager',
  },
  active: {
    optional: true,
    isIn: ['inactive', 'active', 'deleted'],
    errorMessage: 'Must be one of inactive, active, or deleted',
  },
})

export default userValiation