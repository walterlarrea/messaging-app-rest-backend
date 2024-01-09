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

app.use(express.static('dist'))

app.use('/api/user', usersRouter)
app.use('/api/login', loginRouter)
app.use('/refresh', refreshRouter)

app.use(middleware.verifyAccessToken)

app.use('/api/channel', channelsRouter)
app.use('/api/friends', friendsRouter)

app.use(middleware.unknownEndpoint)

export default app
