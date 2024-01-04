import { Router } from 'express'
import { validationResult } from 'express-validator'
import channelValidation from '../validators/channelValidation.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { channels } from '../db/schema/channel.schema.js'
import { eq, like } from 'drizzle-orm'

const channelsRouter = Router()

channelsRouter.get('/', async (req, res) => {
	const [database] = await getDatabase()

	const result = await database.select().from(channels)

	// closeConnection()
	return res.json(result)
})

channelsRouter.get('/:id', async (req, res) => {
	const requestedId = req.params.id
	const [database] = await getDatabase()

	const result = await database
		.select()
		.from(channels)
		.where(eq(channels.id, requestedId))

	// closeConnection()
	return result.length > 0
		? res.json(result[0])
		: res.status(404).json({ error: 'channel not found on the platform' })
})

channelsRouter.delete('/:id', async (req, res) => {
	const requestedId = req.params.id
	const [database] = await getDatabase()

	const result = await database
		.select()
		.from(channels)
		.where(eq(channels.id, requestedId))

	if (result.length === 0) {
		return res.status(404).json({ error: 'channel not found on the platform' })
	}

	const [deletionInfo] = await database
		.delete(channels)
		.where(eq(channels.id, requestedId))

	// closeConnection()
	return deletionInfo.affectedRows > 0
		? res.status(200).json({ msg: 'channel deleted from the platform' })
		: res.status(404).json({ error: 'not able to perform action delete' })
})

channelsRouter.post('/', channelValidation, async (req, res) => {
	const { title, description, owner_id } = req.body

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
		ownerId: owner_id,
	})

	const channelCreated = await database
		.select({
			channelId: channels.id,
		})
		.from(channels)
		.where(like(channels.title, title))

	// closeConnection()
	return res.status(201).json(channelCreated[0])
})

export default channelsRouter
