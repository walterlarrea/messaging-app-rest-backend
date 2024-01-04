import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { Router } from 'express'
import { JWT_SECRET } from '../constants/config.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { UserSchema } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

const loginRouter = Router()

loginRouter.post('/', async (req, res) => {
	const { email, password } = req.body

	const [database] = await getDatabase()

	const result = await database
		.select({
			id: UserSchema.id,
			email: UserSchema.email,
			firstName: UserSchema.firstName,
			lastName: UserSchema.lastName,
			username: UserSchema.username,
			password: UserSchema.password,
			userType: UserSchema.userType,
			status: UserSchema.status,
		})
		.from(UserSchema)
		.where(like(UserSchema.email, email))

	if (result.length === 0) {
		return res.status(400).json({ errors: [{ msg: 'Email not registered' }] })
	}
	if (result.length > 1) {
		return res
			.status(400)
			.json({ errors: [{ msg: 'An unexpected error ocurred' }] })
	}

	const user = result[0]

	const passwordCorrect =
		user === null ? false : await compare(password, user.password)

	if (!(user && passwordCorrect)) {
		return res.status(400).json({ error: 'invalid username or password' })
	}

	const userForToken = {
		username: user.username,
		id: user.id,
	}

	const token = jwt.sign(userForToken, JWT_SECRET, {
		expiresIn: 60 * 60,
	})

	// closeConnection()
	res
		.status(200)
		.send({ token, username: user.username, firstName: user.firstName })
})

export default loginRouter
