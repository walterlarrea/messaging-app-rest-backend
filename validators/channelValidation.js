import { checkSchema } from 'express-validator'

const channelValidation = checkSchema({
  name: {
    notEmpty: {
      errorMessage: 'A channel name is required'
    },
    isLength: {
      options: { min: 10, max: 50 },
      errorMessage: 'Must have between 10 and 50 characters',
    },
    errorMessage: 'Invalid name',
  },
  description: {
    notEmpty: {
      errorMessage: 'A channel description is required'
    },
    isLength: {
      options: { min: 20, max: 100 },
      errorMessage: 'Must have between 20 and 100 characters',
    },
    errorMessage: 'Invalid description',
  },
  owner_id: {
    isInt: true,
    notEmpty: {
      errorMessage: 'Must specify the channel\'s owner ID'
    },
    errorMessage: 'Invalid owner ID',
  },
})

export default channelValidation