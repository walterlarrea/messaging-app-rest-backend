import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { JWT_SECRET } from '../constants/config.js'
import { getMysqlDatabase } from '../utils/mySqlConnection.js'
import { users } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

export const handleLogin = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		return res
			.status(400)
			.json({ errors: [{ msg: 'Email and passwords are required' }] })
	}

	const [database, closeConnection] = await getMysqlDatabase()

	const result = await database
		.select({
			id: users.id,
			email: users.email,
			username: users.username,
			password: users.password,
			userType: users.userType,
			status: users.status,
		})
		.from(users)
		.where(like(users.email, email))

	if (result.length === 0) {
		return res.status(400).json({ errors: [{ msg: 'User not found' }] })
	}
	const user = result[0]
	if (user.status !== 'active') {
		return res.status(400).json({ errors: [{ msg: 'User not activated' }] })
	}
	if (result.length > 1) {
		return res
			.status(400)
			.json({ errors: [{ msg: 'An unexpected error ocurred' }] })
	}

	const passwordCorrect =
		user === null ? false : await compare(password, user.password)

	if (!(user && passwordCorrect)) {
		return res
			.status(400)
			.json({ errors: [{ msg: 'invalid username or password' }] })
	}

	const userForToken = {
		username: user.username,
		id: user.id,
	}
	const accessToken = jwt.sign(userForToken, JWT_SECRET, {
		expiresIn: '1h', // Put to 1 hour
	})
	const refreshToken = jwt.sign(userForToken, JWT_SECRET, {
		expiresIn: '1d',
	})

	await database
		.update(users)
		.set({ refreshToken: refreshToken })
		.where(like(users.email, email))

	await closeConnection()

	res.cookie('refresh_token', refreshToken, {
		httpOnly: true,
		sameSite: 'None',
		secure: true,
		maxAge: 1 * 60 * 60 * 1000,
	})
	res.status(200).send({ accessToken, role: user.userType, userId: user.id })
}

export default handleLogin
