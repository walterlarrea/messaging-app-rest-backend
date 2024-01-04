import { checkSchema } from 'express-validator'

const friendRequestValidation = checkSchema({
	by_user_id: {
		isInt: true,
		notEmpty: {
			errorMessage: 'Both users are needed to send a friend request',
		},
		errorMessage: 'Invalid user ID',
	},
	to_user_id: {
		isInt: true,
		notEmpty: {
			errorMessage: 'Both users are needed to send a friend request',
		},
		errorMessage: 'Invalid user ID',
	},
	status: {
		isString: true,
		isIn: { options: [['req_uid1', 'req_uid2', 'approved']] },
		errorMessage: 'Must be declared and be one of req_uid1, or req_uid2',
	},
})

export default friendRequestValidation
