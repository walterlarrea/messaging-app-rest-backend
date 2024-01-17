import { Router } from 'express'
import messageController from '../../controllers/messageController.js'

const router = Router()

router.get('/', messageController.getUsersChat)
router.post('/', messageController.createMessage)

export default router
