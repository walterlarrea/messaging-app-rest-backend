import express from 'express'
import cors from 'cors'
import usersRouter from './controllers/users.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.use('/api/user', usersRouter)

app.get('/api/login', (request, response) => {
  response.json({ LOGIN: 'endpoint' })
})

export default app