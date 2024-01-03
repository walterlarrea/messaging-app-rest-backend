import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { Router } from 'express'
import { JWT_SECRET } from '../constants/config.js'
import { getDatabaseTable } from '../utils/mySqlConnection.js'
import { responseFormatter } from '../utils/mySqlHelper.js'

const loginRouter = Router()

loginRouter.post('/', async (req, res) => {
	const { email, password } = req.body

	const [userTable, closeSession] = await getDatabaseTable('users')

	const response = await userTable
		.select([
			'id',
			'email',
			'first_name',
			'last_name',
			'username',
			'password',
			'user_type',
			'status',
		])
		.where('email = :email')
		.bind('email', email)
		.execute()

	const foundUsers = response.fetchAll()

	if (foundUsers.length === 0) {
		return res.status(400).json({ errors: [{ msg: 'Email not registered' }] })
	}
	if (foundUsers.length > 1) {
		return res
			.status(400)
			.json({ errors: [{ msg: 'An unexpected error ocurred' }] })
	}

	const columns = response.getColumns().map((col) => col.getColumnName())
	const user = responseFormatter(columns, foundUsers)[0]

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

	closeSession()
	res
		.status(200)
		.send({ token, username: user.username, firstName: user.first_name })
})

export default loginRouter
