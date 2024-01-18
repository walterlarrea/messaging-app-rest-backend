import UserMessage from '../db/schema/userMessage.schema.js'

const getUsersChat = async (req, res) => {
	if (!req.user?.id) {
		return res.status(401).json({ errors: ['token missing or invalid'] })
	}
	const userId = parseInt(req.user.id)
	const targetUserId = req.params.id

	if (!targetUserId || targetUserId === userId) {
		return res.status(400).send({ errors: ['Target user is invalid'] })
	}

	const chatMessages = await UserMessage.find({
		senderId: { $in: [userId, targetUserId] },
		receiverId: { $in: [userId, targetUserId] },
	})

	return res.status(200).send(chatMessages)
}

const createMessage = async (req, res) => {
	if (!req.user?.id) {
		return res.status(401).json({ errors: ['token missing or invalid'] })
	}
	const userId = parseInt(req.user.id)
	const { target_user_id: receiverId, content } = req.body

	if (!receiverId) {
		return res.status(400).send({ errors: ['Target user is invalid'] })
	}
	if (!content || content === '') {
		return res.status(400).send({ errors: ['Message content is empty'] })
	}

	const message = new UserMessage({
		senderId: userId,
		receiverId: receiverId,
		content: content,
	})

	const savedMessage = await message.save().catch((error) => console.log(error))

	return res.status(201).send(savedMessage)
}

export default {
	getUsersChat,
	createMessage,
}
