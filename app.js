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

const app = express()

// app.use(middleware.requestLogger)

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

app.use(middleware.unknownEndpoint)

export default app
