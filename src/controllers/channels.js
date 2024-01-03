import { Router } from 'express'
import { validationResult } from 'express-validator'
import channelValidation from '../validators/channelValidation.js'
import { getDatabaseTable } from '../utils/mySqlConnection.js'
// import { responseFormatter } from '../utils/mySqlHelper.js'

const channelsRouter = Router()

channelsRouter.post('/', channelValidation, async (req, res) => {
	const { title, description, owner_id } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [channelTable, closeSession] = await getDatabaseTable('channels')

	const existingChannel = await channelTable
		.select()
		.where('title like :title')
		.bind('title', title)
		.execute()

	if (existingChannel.fetchAll().length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'A channel with the title provided already exists' }],
		})
	}

	const channelCreated = await channelTable
		.insert(['title', 'description', 'owner_id'])
		.values([title, description, owner_id])
		.execute()
		.catch()

	closeSession()
	return res.status(201).json({
		channelId: channelCreated.getAutoIncrementValue(),
	})
})

export default channelsRouter
