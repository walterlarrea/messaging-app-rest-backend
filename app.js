import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import usersRouter from './src/controllers/users.js'
import loginRouter from './src/controllers/login.js'
import channelsRouter from './src/controllers/channels.js'
import friendsRouter from './src/controllers/friends.js'
import middleware from './src/utils/middleware.js'
import corsOptions from './src/constants/corsOptions.js'
import refreshRouter from './src/controllers/refreshTokenController.js'

const app = express()

// app.use(middleware.requestLogger)

app.use(middleware.credentials)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use(middleware.tokenExtractor)

app.use(express.static('dist'))

// app.get('/', (request, response) => {
// 	response.send('<h1>Hello World!</h1>')
// })

app.use('/api/user', usersRouter)
app.use('/api/login', loginRouter)
app.use('/refresh', refreshRouter)
app.use('/api/channel', middleware.userExtractor, channelsRouter)
app.use('/api/friends', middleware.userExtractor, friendsRouter)

app.use(middleware.unknownEndpoint)

export default app
