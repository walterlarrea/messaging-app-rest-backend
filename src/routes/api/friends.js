import { Router } from 'express'
import friendsController from '../../controllers/friendsController.js'

const router = Router()

router.get('/', friendsController.getAllFriends)
router.get('/incoming-requests', friendsController.friendRequests)
router.patch('/request', friendsController.requestFriend)
router.post('/request', friendsController.approveFriendRequest)

export default router
