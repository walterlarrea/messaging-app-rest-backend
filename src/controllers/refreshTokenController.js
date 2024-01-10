import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/config.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { users } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

export const handleRefreshToken = async (req, res) => {
	const cookies = req.cookies

	if (!cookies?.refresh_token) return res.sendStatus(401)
	const refreshToken = cookies.refresh_token

	const [database] = await getDatabase()

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
		.where(like(users.refreshToken, refreshToken))

	if (result.length === 0) {
		return res.status(400).json({ errors: [{ msg: 'User not found' }] })
	}
	const user = result[0]

	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if (err || user.username !== decoded.username) return res.sendStatus(403)
		const userForToken = {
			username: user.username,
			id: user.id,
		}
		const accessToken = jwt.sign(userForToken, JWT_SECRET, { expiresIn: '1h' })
		res.json({ accessToken, role: user.userType })
	})
}
