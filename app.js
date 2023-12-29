import express from 'express'
import cors from 'cors'
import usersRouter from './controllers/users.js'
import loginRouter from './controllers/login.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.use('/api/user', usersRouter)
app.use('/api/login', loginRouter)

export default app