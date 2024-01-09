import { validationResult } from 'express-validator'
import { users } from '../db/schema/user.schema.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { and, like, or } from 'drizzle-orm'
import { hash } from 'bcrypt'

export const handleNewUser = async (req, res) => {
	const { email, first_name, last_name, username, password } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [database] = await getDatabase()

	const existingUser = await database
		.select({
			id: users.id,
			email: users.email,
			firstName: users.firstName,
			lastName: users.lastName,
			username: users.username,
			userType: users.userType,
			status: users.status,
		})
		.from(users)
		.where(or(like(users.email, email), like(users.username, username)))

	if (existingUser.length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'username and email must be unique' }],
		})
	}

	const saltRounds = 10
	const passwordHash = await hash(password, saltRounds)

	await database.insert(users).values({
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
			userId: users.id,
		})
		.from(users)
		.where(and(like(users.email, email), like(users.username, username)))

	// closeConnection()
	res.status(201).json(userCreated[0])
}
