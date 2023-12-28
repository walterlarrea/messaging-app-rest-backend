import { hash } from 'bcrypt'
import express from 'express'
import getSessionTable from '../utils/mySqlConnection.js'

const usersRouter = express.Router()

usersRouter.get('/', async (req, res) => {
  const [userTable, closeSession] = await getSessionTable('user')

  const result = await userTable.select().execute()
  const users = result.fetchAll()

  closeSession()
  res.json(users)
})

usersRouter.get('/:email', async (req, res) => {
  const [userTable, closeSession] = await getSessionTable('user')

  const result = await userTable.select()
    .where('email like :email')
    .bind('email', req.params.email)
    .execute()
  const user = result.fetchOne()

  closeSession()
  user ? res.json(user)
    : res.status(404).json({
      error: 'user not found on the platform'
    })
})

usersRouter.post('/', async (req, res) => {
  const { email, name, last_name, username, password } = req.body

  const [userTable, closeSession] = await getSessionTable('user')

  const existingUser = await userTable
    .select()
    .where('username like :username && email like :email')
    .bind('email', email)
    .bind('username', username)
    .execute()

  if (existingUser.fetchAll().length > 0) {
    return res.status(400).json({
      error: 'username and email must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await hash(password, saltRounds)

  const userCreated = await userTable
    .insert(['email', 'name', 'last_name',
      'username', 'password', 'user_type', 'active'])
    .values([email, name, last_name,
      username, passwordHash, 'user', 'inactive'])
    .execute()

  console.log(userCreated.getWarningsCount())

  closeSession()
  res.status(201).json({
    userId: userCreated.getAutoIncrementValue()
  })
})

export default usersRouter