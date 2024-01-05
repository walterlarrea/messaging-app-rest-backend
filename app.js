import express from 'express'
import cors from 'cors'
import usersRouter from './src/controllers/users.js'
import loginRouter from './src/controllers/login.js'
import channelsRouter from './src/controllers/channels.js'
import friendsRouter from './src/controllers/friends.js'
import middleware from './src/utils/middleware.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.use('/api/user', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/channel', channelsRouter)
app.use('/api/friends', middleware.userExtractor, friendsRouter)

export default app
