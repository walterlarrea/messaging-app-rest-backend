import { Router } from 'express'
import friendsController from '../../controllers/friendsController.js'

const router = Router()

router.get('/', friendsController.getAllFriends)
router.get('/incoming-requests', friendsController.friendRequests)
router.patch('/incoming-requests', friendsController.markSeenFriendRequest)
router.patch('/request', friendsController.approveFriendRequest)
router.post('/request', friendsController.requestFriend)

export default router
