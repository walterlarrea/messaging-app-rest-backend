import { hash } from 'bcrypt'
import { Router } from 'express'
import { validationResult } from 'express-validator'
import userValidation from '../validators/userValidation.js'
import getSessionForTable from '../utils/mySqlConnection.js'
import { responseFormatter } from '../utils/mySqlHelper.js'

const usersRouter = Router()

usersRouter.get('/', async (req, res) => {
	const [userTable, closeSession] = await getSessionForTable('users')

	const result = await userTable
		.select([
			'id',
			'email',
			'name',
			'last_name',
			'username',
			'user_type',
			'active',
		])
		.execute()

	const columns = result.getColumns().map((col) => col.getColumnName())
	const users = responseFormatter(columns, result.fetchAll())

	closeSession()
	res.json(users)
})

usersRouter.get('/:email', async (req, res) => {
	const [userTable, closeSession] = await getSessionForTable('users')
	const requestedEmail = req.params.email

	const result = await userTable
		.select([
			'id',
			'email',
			'name',
			'last_name',
			'username',
			'user_type',
			'active',
		])
		.where('email like :email')
		.bind('email', requestedEmail)
		.execute()

	const columns = result.getColumns().map((col) => col.getColumnName())
	const user = responseFormatter(columns, [result.fetchOne()])[0]

	closeSession()
	user
		? res.json(user)
		: res.status(404).json({
				error: 'user not found on the platform',
			})
})

usersRouter.post('/', userValidation, async (req, res) => {
	const { email, name, last_name, username, password } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [userTable, closeSession] = await getSessionForTable('users')

	const existingUser = await userTable
		.select([
			'id',
			'email',
			'name',
			'last_name',
			'username',
			'user_type',
			'active',
		])
		.where('username like :username || email like :email')
		.bind('email', email)
		.bind('username', username)
		.execute()

	if (existingUser.fetchAll().length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'username and email must be unique' }],
		})
	}

	const saltRounds = 10
	const passwordHash = await hash(password, saltRounds)

	const userCreated = await userTable
		.insert([
			'email',
			'name',
			'last_name',
			'username',
			'password',
			'user_type',
			'active',
		])
		.values([
			email,
			name,
			last_name || '',
			username,
			passwordHash,
			'user',
			'inactive',
		])
		.execute()

	closeSession()
	res.status(201).json({
		userId: userCreated.getAutoIncrementValue(),
	})
})

export default usersRouter
