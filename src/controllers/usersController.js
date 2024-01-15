import { getDatabase } from '../utils/mySqlConnection.js'
import { users } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

const getAllUsers = async (req, res) => {
	const [database, closeConnection] = await getDatabase()

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

	await closeConnection()

	res.json(result)
}

const getByEmail = async (req, res) => {
	const requestedEmail = req.params.email
	const [database, closeConnection] = await getDatabase()

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

	await closeConnection()

	if (result.length > 0) {
		return res.json(result)
	} else {
		res
			.status(404)
			.json({ errors: [{ msg: 'user not found on the platform' }] })
	}
}

export default {
	getAllUsers,
	getByEmail,
}
