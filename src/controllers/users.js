import { Router } from 'express'
import { getDatabase } from '../utils/mySqlConnection.js'
import { users } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

const usersRouter = Router()

usersRouter.get('/', async (req, res) => {
	const [database] = await getDatabase()

	const result = await database
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

	// closeConnection()
	res.json(result)
})

usersRouter.get('/:email', async (req, res) => {
	const requestedEmail = req.params.email
	const [database] = await getDatabase()

	const result = await database
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
		.where(like(users.email, requestedEmail))

	// closeConnection()
	result.length > 0
		? res.json(result)
		: res.status(404).json({ error: 'user not found on the platform' })
})

export default usersRouter
