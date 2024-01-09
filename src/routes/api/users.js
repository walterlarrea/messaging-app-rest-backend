import { Router } from 'express'
import usersController from '../../controllers/usersController.js'

const router = Router()

router.get('/', usersController.getAllUsers)
router.get('/:email', usersController.getByEmail)

export default router
