import { hash } from 'bcrypt'
import express from 'express'
import { validationResult } from 'express-validator'
import userValiation from '../validators/userValidation.js'
import getSessionTable from '../utils/mySqlConnection.js'

const usersRouter = express.Router()

usersRouter.get('/', async (req, res) => {
  const [userTable, closeSession] = await getSessionTable('user')

  const result = await userTable
    .select(['id', 'email', 'name', 'last_name', 'username', 'user_type', 'active'])
    .execute()
  const columns = result.getColumns().map(col => col.getColumnName())

  const users = result.fetchAll().map(user =>
    user.reduce((acc, val, i) => {
      return { ...acc, [columns[i]]: val }
    }, {}))

  closeSession()
  res.json(users)
})

/* usersRouter.get('/:id', async (req, res) => {
  const [userTable, closeSession] = await getSessionTable('user')
  const requestedId = req.params.id

  const result = await userTable
    .select(['id', 'email', 'name', 'last_name', 'username', 'user_type', 'active'])
    .where('id like :id')
    .bind('id', requestedId)
    .execute()
  const columns = result.getColumns().map(col => col.getColumnName())

  const user = [result.fetchOne()].map(user =>
    user.reduce((acc, val, i) => {
      return { ...acc, [columns[i]]: val }
    }, {}))

  closeSession()
  user ? res.json(user)
    : res.status(404).json({
      error: 'user not found on the platform'
    })
}) */

usersRouter.get('/:email', async (req, res) => {
  const [userTable, closeSession] = await getSessionTable('user')
  const requestedEmail = req.params.email

  const result = await userTable
    .select(['id', 'email', 'name', 'last_name', 'username', 'user_type', 'active'])
    .where('email like :email')
    .bind('email', requestedEmail)
    .execute()
  const columns = result.getColumns().map(col => col.getColumnName())

  const user = [result.fetchOne()].map(user =>
    user.reduce((acc, val, i) => {
      return { ...acc, [columns[i]]: val }
    }, {}))

  closeSession()
  user ? res.json(user)
    : res.status(404).json({
      error: 'user not found on the platform'
    })
})

usersRouter.post('/', userValiation, async (req, res) => {
  const { email, name, last_name, username, password } = req.body

  const { errors } = validationResult(req)
  if (errors.length > 0) {
    return res.status(422).json({ errors })
  }

  const [userTable, closeSession] = await getSessionTable('user')

  const existingUser = await userTable
    .select()
    .where('username like :username || email like :email')
    .bind('email', email)
    .bind('username', username)
    .execute()

  if (existingUser.fetchAll().length > 0) {
    return res.status(400).json({
      errors: [
        { msg: 'username and email must be unique' }
      ]
    })
  }

  const saltRounds = 10
  const passwordHash = await hash(password, saltRounds)

  const userCreated = await userTable
    .insert(['email', 'name', 'last_name',
      'username', 'password', 'user_type', 'active'])
    .values([email, name, last_name || '',
      username, passwordHash, 'user', 'inactive'])
    .execute()

  closeSession()
  res.status(201).json({
    userId: userCreated.getAutoIncrementValue()
  })
})

export default usersRouter