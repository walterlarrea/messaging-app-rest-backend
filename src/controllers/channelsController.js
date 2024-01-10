import { validationResult } from 'express-validator'
import { getDatabase } from '../utils/mySqlConnection.js'
import { channels } from '../db/schema/channel.schema.js'
import { eq, like } from 'drizzle-orm'

const gelAllChannels = async (req, res) => {
	const [database] = await getDatabase()

	const result = await database.select().from(channels)

	// closeConnection()
	return res.json(result)
}

const getById = async (req, res) => {
	const requestedId = req.params.id
	const [database] = await getDatabase()

	const result = await database
		.select()
		.from(channels)
		.where(eq(channels.id, requestedId))

	// closeConnection()
	if (result.length > 0) {
		res.json(result[0])
	} else {
		res
			.status(404)
			.json({ errors: [{ msg: 'channel not found on the platform' }] })
	}
}

const deleteById = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)

	const requestedId = req.params.id
	const [database] = await getDatabase()

	const result = await database
		.select()
		.from(channels)
		.where(eq(channels.id, requestedId))

	if (result.length === 0) {
		return res
			.status(404)
			.json({ errors: [{ msg: 'channel not found on the platform' }] })
	}
	const channel = result[0]
	if (channel.ownerId !== userId) {
		return res
			.status(403)
			.json({ errors: [{ msg: 'not the owner of the channel' }] })
	}

	const [deletionInfo] = await database
		.delete(channels)
		.where(eq(channels.id, requestedId))

	// closeConnection()
	if (deletionInfo.affectedRows > 0) {
		return res.status(200).json({ msg: 'channel deleted from the platform' })
	} else {
		return res
			.status(404)
			.json({ errors: [{ msg: 'not able to perform action delete' }] })
	}
}

const createChannel = async (req, res) => {
	if (!req.user) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)

	const { title, description } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [database] = await getDatabase()

	const existingChannel = await database
		.select()
		.from(channels)
		.where(like(channels.title, title))

	if (existingChannel.length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'A channel with the title provided already exists' }],
		})
	}

	await database.insert(channels).values({
		title,
		description,
		ownerId: userId,
	})

	const channelCreated = await database
		.select({
			channelId: channels.id,
		})
		.from(channels)
		.where(like(channels.title, title))

	// closeConnection()
	return res.status(201).json(channelCreated[0])
}

export default {
	gelAllChannels,
	getById,
	createChannel,
	deleteById,
}
