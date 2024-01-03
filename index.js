import app from './app.js'
import http from 'http'
import { SERVER_PORT, } from './src/constants/config.js'

const server = http.createServer(app)

server.listen(SERVER_PORT, () => {
	console.log(`Server running on port ${SERVER_PORT}`)
})
