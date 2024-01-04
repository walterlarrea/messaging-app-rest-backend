import { Router } from 'express'
import { validationResult } from 'express-validator'
import channelValidation from '../validators/channelValidation.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { ChannelSchema } from '../db/schema/channel.schema.js'
import { like } from 'drizzle-orm'

const channelsRouter = Router()

channelsRouter.get('/', async (req, res) => {
	const [database] = await getDatabase()

	const result = await database.select().from(ChannelSchema)

	// closeConnection()
	res.json(result)
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
		.from(ChannelSchema)
		.where(like(ChannelSchema.title, title))

	if (existingChannel.length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'A channel with the title provided already exists' }],
		})
	}

	await database.insert(ChannelSchema).values({
		title,
		description,
		ownerId: owner_id,
	})

	const channelCreated = await database
		.select({
			channelId: ChannelSchema.id,
		})
		.from(ChannelSchema)
		.where(like(ChannelSchema.title, title))

	// closeConnection()
	return res.status(201).json(channelCreated[0])
})

export default channelsRouter
