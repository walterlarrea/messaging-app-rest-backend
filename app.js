import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import corsOptions from './src/constants/corsOptions.js'

import registerRouter from './src/routes/register.js'
import loginRouter from './src/routes/auth.js'
import refreshToken from './src/routes/refresh.js'

import middleware from './src/utils/middleware.js'
import usersRouter from './src/routes/api/users.js'
import channelsRouter from './src/routes/api/channels.js'
import friendsRouter from './src/routes/api/friends.js'
import messagesRouter from './src/routes/api/messages.js'
import mongoose from 'mongoose'
import logger from './src/utils/logger.js'
import { MONGODB_URI } from './src/constants/config.js'

const app = express()

logger.info('connecting to', MONGODB_URI)

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		logger.info('connected to MongoDB')
	})
	.catch((error) => {
		logger.error('error connecting to MongoDB: ', error.message)
	})

if (process.env.NODE_ENV !== 'TEST') {
	app.use(middleware.requestLogger)
}

app.use(middleware.credentials)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use(express.static('dist'))

app.use('/register', registerRouter)
app.use('/auth', loginRouter)
app.use('/refresh', refreshToken)

app.use(middleware.verifyAccessToken)

app.use('/api/user', usersRouter)
app.use('/api/channel', channelsRouter)
app.use('/api/friends', friendsRouter)
app.use('/api/message', messagesRouter)

app.use(middleware.unknownEndpoint)

export default app
