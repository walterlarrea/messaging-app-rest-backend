import app from './app.js'
import http from 'http'
import { Server } from 'socket.io'
import { SERVER_PORT } from './src/constants/config.js'
import socket from './src/utils/webSocketHandler.js'

const server = http.createServer(app)

const io = new Server(server, {
	path: '/ws',
	cors: {
		origin: '*',
	},
})

socket(io)
global.io = io

server.listen(SERVER_PORT, () => {
	console.log(`Server running on port ${SERVER_PORT}`)
})
