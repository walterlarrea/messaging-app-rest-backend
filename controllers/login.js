import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { Router } from 'express'
import config from '../utils/config.js'
import getSessionForTable from '../utils/mySqlConnection.js'
import { responseFormatter } from '../utils/mySqlHelper.js'

const loginRouter = Router()

loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body

  const [userTable, closeSession] = await getSessionForTable('user')

  const response = await userTable
    .select(['id', 'email', 'name', 'last_name', 'username', 'password', 'user_type', 'active'])
    .where('email = :email')
    .bind('email', email)
    .execute()

  const columns = response.getColumns().map(col => col.getColumnName())
  const user = responseFormatter(columns, [response.fetchOne()])[0]

  const passwordCorrect = user === null
    ? false
    : await compare(password, user.password)

  if (!(user && passwordCorrect)) {
    return res.status(400).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }
  console.log(config.JWT_SECRET)
  const token = jwt.sign(
    userForToken,
    config.JWT_SECRET,
    { expiresIn: 60 * 60 }
  )

  closeSession()
  res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

export default loginRouter