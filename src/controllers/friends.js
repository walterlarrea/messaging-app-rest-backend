import { Router } from 'express'
import { validationResult } from 'express-validator'
import friendRequestValidation from '../validators/friendReqValidation.js'
import { getDatabase } from '../utils/mySqlConnection.js'
import { friends } from '../db/schema/friend.schema.js'
import { and, eq, or } from 'drizzle-orm'

const friendsRouter = Router()

friendsRouter.get('/:id', async (req, res) => {
	const userId = req.params.id
	const [database] = await getDatabase()

	const results = await database
		.select()
		.from(friends)
		.where(
			and(
				or(eq(friends.uid1, userId), eq(friends.uid2, userId)),
				eq(friends.status, 'approved')
			)
		)

	return res.status(200).send(results)
})

friendsRouter.get('/incoming-requests/:id', async (req, res) => {
	const userId = req.params.id
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
})

friendsRouter.patch('/request', friendRequestValidation, async (req, res) => {
	const { by_user_id, to_user_id } = req.body

	const { errors } = validationResult(req)
	if (errors.length > 0) {
		return res.status(422).json({ errors })
	}

	const [database] = await getDatabase()

	const validFriendRequest = await database
		.select()
		.from(friends)
		.where(
			or(
				and(
					and(eq(friends.uid1, by_user_id), eq(friends.uid2, to_user_id)),
					eq(friends.status, 'req_uid1')
				),
				and(
					and(eq(friends.uid1, to_user_id), eq(friends.uid2, by_user_id)),
					eq(friends.status, 'req_uid2')
				)
			)
		)

	if (validFriendRequest.length === 0) {
		console.log('Req invalid = ', validFriendRequest[0])
		return res.status(404).send({ error: 'Pending friend request not found' })
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

	const createdFriendRelation = await database
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

	return createdFriendRelation.length > 0
		? res.json(createdFriendRelation[0])
		: res.status(500).send({ error: 'Unexpected error' })
})

friendsRouter.post('/request', async (req, res) => {
	const { by_user_id, to_user_id } = req.body
	const [database] = await getDatabase()

	const existingFriendRequestFromUser = await database
		.select()
		.from(friends)
		.where(
			or(
				and(eq(friends.uid1, by_user_id), eq(friends.uid2, to_user_id)),
				and(eq(friends.uid1, to_user_id), eq(friends.uid2, by_user_id))
			)
		)

	if (existingFriendRequestFromUser.length > 0) {
		console.log('Req status = ', existingFriendRequestFromUser[0])
		return res
			.status(405)
			.send({ error: 'Already made a friends request to the requested user' })
	}

	await database.insert(friends).values({
		uid1: by_user_id,
		uid2: to_user_id,
		status: 'req_uid1',
	})

	const friendRequestCreated = await database
		.select()
		.from(friends)
		.where(and(eq(friends.uid1, by_user_id), eq(friends.uid2, to_user_id)))

	return res.status(201).json(friendRequestCreated[0])
})

export default friendsRouter
