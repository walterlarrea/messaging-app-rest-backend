import { Router } from 'express'
import { validationResult } from 'express-validator'
import channelValidation from '../validators/channelValidation.js'
import getSessionForTable from '../utils/mySqlConnection.js'
// import { responseFormatter } from '../utils/mySqlHelper.js'

const channelsRouter = Router()

channelsRouter.post('/', channelValidation, async (req, res) => {
	const { name, description, owner_id } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [channelTable, closeSession] = await getSessionForTable('channels')

	const existingChannel = await channelTable
		.select()
		.where('name like :name')
		.bind('name', name)
		.execute()

	if (existingChannel.fetchAll().length > 0) {
		return res.status(400).json({
			errors: [{ msg: 'A channel with the name provided already exists' }],
		})
	}

	const channelCreated = await channelTable
		.insert(['name', 'description', 'owner_id'])
		.values([name, description, owner_id])
		.execute()
		.catch()

	closeSession()
	res.status(201).json({
		channelId: channelCreated.getAutoIncrementValue(),
	})
})

export default channelsRouter
