import logger from './logger.js'
const onlineUsers = {}

export default function webSocketHandler(socket, io) {
	logger.info('A WebSocket user connected')

	socket.on('addOnlineUser', (userId) => {
		if (!onlineUsers[userId]) onlineUsers[userId] = socket.id
		logger.info('New user: ', userId, ' - with socket: ', onlineUsers[userId])
	})

	socket.on('sendMessage', (message) => {
		if (onlineUsers[message.receiverId]) {
			const receiverSocket = io.sockets.sockets.get(
				onlineUsers[message.receiverId]
			)
			receiverSocket.emit('getMessage', message)
		}
	})

	socket.on('disconnect', () => {
		let disconnectedUserId
		for (const id in onlineUsers) {
			if (Object.hasOwnProperty.call(onlineUsers, id)) {
				const element = onlineUsers[id]
				if (element === socket.id) disconnectedUserId = id
			}
		}

		delete onlineUsers[disconnectedUserId]
		// const { [disconnectedUserId]: disconnectedUser, ...rest } = onlineUsers;
		logger.info('A WebSocket user disconnected')
	})
}
