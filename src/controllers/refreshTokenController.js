import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/config.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { users } from '../db/schema/user.schema.js'
import { like } from 'drizzle-orm'

export const handleRefreshToken = async (req, res) => {
	const cookies = req.cookies

	if (!cookies?.refresh_token) return res.sendStatus(401)
	const UserRefreshToken = cookies.refresh_token

	const [database, closeConnection] = await getDatabase()

	jwt.verify(UserRefreshToken, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) return res.sendStatus(403)

		const result = await database
			.select({
				id: users.id,
				email: users.email,
				username: users.username,
				password: users.password,
				userType: users.userType,
				status: users.status,
				refreshToken: users.refreshToken,
			})
			.from(users)
			.where(like(users.username, decoded.username))
		if (result.length === 0)
			return res.status(400).json({ errors: [{ msg: 'User not found' }] })

		const user = result[0]

		if (user.refreshToken !== UserRefreshToken)
			return res
				.status(403)
				.json({ errors: [{ msg: 'Token provided is not valid' }] })

		const userForToken = {
			username: user.username,
			id: user.id,
		}
		const accessToken = jwt.sign(userForToken, JWT_SECRET, { expiresIn: '1h' })
		const refreshToken = jwt.sign(userForToken, JWT_SECRET, {
			expiresIn: '1d',
		})

		await database
			.update(users)
			.set({ refreshToken: refreshToken })
			.where(like(users.email, user.email))

		await closeConnection()

		res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			sameSite: 'None',
			secure: true,
			maxAge: 1 * 60 * 60 * 1000,
		})
		res.json({ accessToken, role: user.userType })
	})
}
