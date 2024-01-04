import { hash } from 'bcrypt'
import { Router } from 'express'
import { validationResult } from 'express-validator'
import userValidation from '../validators/userValidation.js'
import { getDatabase } from '../utils/mySqlConnection.js'

import { UserSchema } from '../db/schema/user.schema.js'
import { like, or, and } from 'drizzle-orm'

const usersRouter = Router()

usersRouter.get('/', async (req, res) => {
	const [database] = await getDatabase()

	const result = await database
		.select({
			id: UserSchema.id,
			email: UserSchema.email,
			firstName: UserSchema.firstName,
			lastName: UserSchema.lastName,
			username: UserSchema.username,
			userType: UserSchema.userType,
			status: UserSchema.status,
		})
		.from(UserSchema)

	// closeConnection()
	res.json(result)
})

usersRouter.get('/:email', async (req, res) => {
	const requestedEmail = req.params.email
	const [database] = await getDatabase()

	const result = await database
		.select({
			id: UserSchema.id,
			email: UserSchema.email,
			firstName: UserSchema.firstName,
			lastName: UserSchema.lastName,
			username: UserSchema.username,
			userType: UserSchema.userType,
			status: UserSchema.status,
		})
		.from(UserSchema)
		.where(like(UserSchema.email, requestedEmail))

	// closeConnection()
	result.length > 0
		? res.json(result)
		: res.status(404).json({ error: 'user not found on the platform' })
})

usersRouter.post('/', userValidation, async (req, res) => {
	const { email, first_name, last_name, username, password } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [database] = await getDatabase()

	const existingUser = await database
		.select({
			id: UserSchema.id,
			email: UserSchema.email,
			firstName: UserSchema.firstName,
			lastName: UserSchema.lastName,
			username: UserSchema.username,
			userType: UserSchema.userType,
			status: UserSchema.status,
		})
		.from(UserSchema)
		.where(
			or(like(UserSchema.email, email), like(UserSchema.username, username))
		)

	if (existingUser.length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'username and email must be unique' }],
		})
	}

	const saltRounds = 10
	const passwordHash = await hash(password, saltRounds)

	await database.insert(UserSchema).values({
		email,
		firstName: first_name,
		lastName: last_name || '',
		username,
		password: passwordHash,
		userType: 'user',
		status: 'inactive',
	})

	const userCreated = await database
		.select({
			userId: UserSchema.id,
		})
		.from(UserSchema)
		.where(
			and(like(UserSchema.email, email), like(UserSchema.username, username))
		)

	// closeConnection()
	res.status(201).json(userCreated[0])
})

export default usersRouter
