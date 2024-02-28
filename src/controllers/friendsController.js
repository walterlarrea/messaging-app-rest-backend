import { getMysqlDatabase } from '../utils/mySqlConnection.js'
import { friends } from '../db/schema/friend.schema.js'
import { and, eq, ne, or } from 'drizzle-orm'
import { users } from '../db/schema/user.schema.js'

const getAllFriends = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)

	const [database, closeConnection] = await getMysqlDatabase()

	const results = await database
		.select({
			id: users.id,
			firstName: users.firstName,
			username: users.username,
		})
		.from(friends)
		.leftJoin(
			users,
			and(
				ne(users.id, userId),
				or(eq(users.id, friends.uid1), eq(users.id, friends.uid2))
			)
		)
		.where(
			and(
				or(eq(friends.uid1, userId), eq(friends.uid2, userId)),
				eq(friends.status, 'approved')
			)
		)

	await closeConnection()

	return res.status(200).send(results)
}

const friendRequests = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = req.user.id

	const [database, closeConnection] = await getMysqlDatabase()

	const results = await database
		.select({
			id: users.id,
			firstName: users.firstName,
			username: users.username,
			unseen: friends.unseen,
		})
		.from(friends)
		.leftJoin(
			users,
			and(
				ne(users.id, userId),
				or(eq(users.id, friends.uid1), eq(users.id, friends.uid2))
			)
		)
		.where(
			or(
				and(eq(friends.uid1, userId), eq(friends.status, 'req_uid2')),
				and(eq(friends.uid2, userId), eq(friends.status, 'req_uid1'))
			)
		)

	await closeConnection()

	return res.status(200).send(results)
}

const markSeenFriendRequest = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)
	const { req_user_id } = req.body

	if (!req_user_id || req_user_id === userId) {
		return res.status(400).send({ errors: [{ msg: 'Target user is invalid' }] })
	}

	const [database, closeConnection] = await getMysqlDatabase()

	const validFriendRequest = await database
		.select()
		.from(friends)
		.where(
			or(
				and(
					and(eq(friends.uid1, req_user_id), eq(friends.uid2, userId)),
					eq(friends.status, 'req_uid1')
				),
				and(
					and(eq(friends.uid1, userId), eq(friends.uid2, req_user_id)),
					eq(friends.status, 'req_uid2')
				)
			)
		)

	if (validFriendRequest.length === 0) {
		return res
			.status(404)
			.send({ errors: [{ msg: 'Pending friend request not found' }] })
	}

	const friendRequest = validFriendRequest[0]

	await database
		.update(friends)
		.set({ unseen: false })
		.where(
			and(
				and(
					eq(friends.uid1, friendRequest.uid1),
					eq(friends.uid2, friendRequest.uid2)
				),
				eq(friends.status, friendRequest.status)
			)
		)

	const seenFriendRequest = await database
		.select({
			id: users.id,
			firstName: users.firstName,
			username: users.username,
			unseen: friends.unseen,
			uid1: friends.uid1,
		})
		.from(friends)
		.leftJoin(users, eq(users.id, friends.uid2))
		.where(
			and(
				and(
					eq(friends.uid1, friendRequest.uid1),
					eq(friends.uid2, friendRequest.uid2)
				),
				eq(friends.unseen, false)
			)
		)

	await closeConnection()

	return seenFriendRequest.length > 0
		? res.status(200).json(seenFriendRequest[0])
		: res.status(500).send({ errors: [{ msg: 'Unexpected error' }] })
}

const approveFriendRequest = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)
	const { req_user_id } = req.body

	if (!req_user_id || req_user_id === userId) {
		return res.status(400).send({ errors: [{ msg: 'Target user is invalid' }] })
	}

	const [database, closeConnection] = await getMysqlDatabase()

	const validFriendRequest = await database
		.select()
		.from(friends)
		.where(
			or(
				and(
					and(eq(friends.uid1, req_user_id), eq(friends.uid2, userId)),
					eq(friends.status, 'req_uid1')
				),
				and(
					and(eq(friends.uid1, userId), eq(friends.uid2, req_user_id)),
					eq(friends.status, 'req_uid2')
				)
			)
		)

	if (validFriendRequest.length === 0) {
		return res
			.status(404)
			.send({ errors: [{ msg: 'Pending friend request not found' }] })
	}

	const friendRequest = validFriendRequest[0]

	await database
		.update(friends)
		.set({ status: 'approved', unseen: false })
		.where(
			and(
				and(
					eq(friends.uid1, friendRequest.uid1),
					eq(friends.uid2, friendRequest.uid2)
				),
				eq(friends.status, friendRequest.status)
			)
		)

	const approvedFriendRelation = await database
		.select({
			id: users.id,
			firstName: users.firstName,
			username: users.username,
			unseen: friends.unseen,
			uid1: friends.uid1,
		})
		.from(friends)
		.leftJoin(users, eq(users.id, friends.uid2))
		.where(
			and(
				and(
					eq(friends.uid1, friendRequest.uid1),
					eq(friends.uid2, friendRequest.uid2)
				),
				eq(friends.status, 'approved')
			)
		)

	await closeConnection()

	const receiverSocket = global.io.sockets.sockets.get(
		global.liveSockets[approvedFriendRelation[0].uid1]
	)
	if (receiverSocket)
		receiverSocket.emit('approvedFriendRequest', approvedFriendRelation[0])

	return approvedFriendRelation.length > 0
		? res.status(200).json(approvedFriendRelation[0])
		: res.status(500).send({ errors: [{ msg: 'Unexpected error' }] })
}

const requestFriend = async (req, res) => {
	if (!req.user?.id) {
		return res.status(401).json({ errors: ['token missing or invalid'] })
	}
	const userId = parseInt(req.user.id)
	const { target_username } = req.body

	if (!target_username) {
		return res.status(400).send({ errors: ['Target user is invalid'] })
	}

	const [database, closeConnection] = await getMysqlDatabase()

	const [targetUser] = await database
		.select()
		.from(users)
		.where(eq(users.username, target_username))

	if (
		!targetUser ||
		targetUser.status !== 'active' ||
		targetUser.id === userId
	) {
		return res.status(400).send({ errors: ['Target user is not valid'] })
	}

	const existingFriendRequestFromUser = await database
		.select()
		.from(friends)
		.where(
			or(
				and(eq(friends.uid1, userId), eq(friends.uid2, targetUser.id)),
				and(eq(friends.uid1, targetUser.id), eq(friends.uid2, userId))
			)
		)

	if (existingFriendRequestFromUser.length > 0) {
		return res
			.status(405)
			.send({ errors: ['Already exists a friend request between users'] })
	}

	await database.insert(friends).values({
		uid1: userId,
		uid2: targetUser.id,
		status: 'req_uid1',
	})

	const createdFriendRequest = await database
		.select({
			id: users.id,
			firstName: users.firstName,
			username: users.username,
			unseen: friends.unseen,
		})
		.from(friends)
		.leftJoin(users, eq(users.id, friends.uid1))
		.where(and(eq(friends.uid1, userId), eq(friends.uid2, targetUser.id)))

	await closeConnection()

	const receiverSocket = global.io.sockets.sockets.get(
		global.liveSockets[targetUser.id]
	)

	if (receiverSocket)
		receiverSocket.emit('getFriendRequest', createdFriendRequest[0])

	return createdFriendRequest.length > 0
		? res.status(201).json(createdFriendRequest[0])
		: res.status(500).send({ errors: ['Unexpected error'] })
}

export default {
	getAllFriends,
	friendRequests,
	requestFriend,
	approveFriendRequest,
	markSeenFriendRequest,
}
