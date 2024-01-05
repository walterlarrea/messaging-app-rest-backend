import { checkSchema } from 'express-validator'

const channelValidation = checkSchema({
	title: {
		notEmpty: {
			errorMessage: 'A channel title is required',
		},
		isLength: {
			options: { min: 10, max: 50 },
			errorMessage: 'Must have between 10 and 50 characters',
		},
		errorMessage: 'Invalid title',
	},
	description: {
		notEmpty: {
			errorMessage: 'A channel description is required',
		},
		isLength: {
			options: { min: 20, max: 100 },
			errorMessage: 'Must have between 20 and 100 characters',
		},
		errorMessage: 'Invalid description',
	},
	owner_id: {
		optional: true,
		isInt: true,
		notEmpty: {
			errorMessage: 'Must specify the channels owner ID',
		},
		errorMessage: 'Invalid owner ID',
	},
})

export default channelValidation
