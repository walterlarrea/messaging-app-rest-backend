import { Router } from 'express'
import channelController from '../../controllers/channelsController.js'
import channelValidation from '../../validators/channelValidation.js'

const router = Router()

router.get('/', channelController.gelAllChannels)
router.get('/:id', channelController.getById)
router.post('/', channelValidation, channelController.createChannel)
router.delete('/:id', channelController.deleteById)

export default router
