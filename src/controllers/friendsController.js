import { getDatabase } from '../utils/mySqlConnection.js'
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

	const [database] = await getDatabase()

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

	return res.status(200).send(results)
}

const friendRequests = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = req.user.id

	const [database] = await getDatabase()

	const results = await database
		.select()
		.from(friends)
		.where(
			or(
				and(eq(friends.uid1, userId), eq(friends.status, 'req_uid2')),
				and(eq(friends.uid2, userId), eq(friends.status, 'req_uid1'))
			)
		)

	return res.status(200).send(results)
}

const approveFriendRequest = async (req, res) => {
	if (!req.user?.id) {
		return res
			.status(401)
			.json({ errors: [{ msg: 'token missing or invalid' }] })
	}
	const userId = parseInt(req.user.id)
	const { approve_user_id } = req.body

	if (!approve_user_id || approve_user_id === userId) {
		return res.status(400).send({ errors: [{ msg: 'Target user is invalid' }] })
	}

	const [database] = await getDatabase()

	const validFriendRequest = await database
		.select()
		.from(friends)
		.where(
			or(
				and(
					and(eq(friends.uid1, approve_user_id), eq(friends.uid2, userId)),
					eq(friends.status, 'req_uid1')
				),
				and(
					and(eq(friends.uid1, userId), eq(friends.uid2, approve_user_id)),
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
		.set({ status: 'approved' })
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
		.select()
		.from(friends)
		.where(
			and(
				and(
					eq(friends.uid1, friendRequest.uid1),
					eq(friends.uid2, friendRequest.uid2)
				),
				eq(friends.status, 'approved')
			)
		)

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

	const [database] = await getDatabase()

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
		.select()
		.from(friends)
		.where(and(eq(friends.uid1, userId), eq(friends.uid2, targetUser.id)))

	return createdFriendRequest.length > 0
		? res.status(201).json(createdFriendRequest[0])
		: res.status(500).send({ errors: ['Unexpected error'] })
}

export default {
	getAllFriends,
	friendRequests,
	requestFriend,
	approveFriendRequest,
}
