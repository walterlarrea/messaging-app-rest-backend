import mongoose from 'mongoose'

const userMessageSchema = new mongoose.Schema({
	senderId: {
		type: Number,
		required: true,
	},
	receiverId: {
		type: Number,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
})

userMessageSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

const UserMessage = mongoose.model('user_messages', userMessageSchema)

export default UserMessage
