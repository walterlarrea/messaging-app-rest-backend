import { Router } from 'express'
import userValidation from '../validators/userValidation.js'
import { handleNewUser } from '../controllers/registerController.js'
const router = Router()

router.post('/', userValidation, handleNewUser)

export default router
