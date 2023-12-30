import app from './app.js'
import http from 'http'
import config from './utils/config.js'

const server = http.createServer(app)

server.listen(config.SERVER_PORT, () => {
	console.log(`Server running on port ${config.SERVER_PORT}`)
})
