import { describe, it, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { eq, or } from 'drizzle-orm'
import { friends } from '../../db/schema/friend.schema.js'

const api = supertest(app)
const [database] = await getDatabase()

describe('Creating friends requests', async () => {
	beforeEach(async () => {
		await database.delete(friends)
		await database.delete(users)

		await api.post('/register').send({
			email: initialUsers[0].email,
			first_name: initialUsers[0].firstName,
			last_name: initialUsers[0].lastName || '',
			username: initialUsers[0].username,
			password: initialUsers[0].password,
			password_confirm: initialUsers[0].password,
		})

		await api.post('/register').send({
			email: initialUsers[1].email,
			first_name: initialUsers[1].firstName,
			last_name: initialUsers[1].lastName || '',
			username: initialUsers[1].username,
			password: initialUsers[1].password,
			password_confirm: initialUsers[1].password,
		})

		await api.post('/register').send({
			email: initialUsers[2].email,
			first_name: initialUsers[2].firstName,
			last_name: initialUsers[2].lastName || '',
			username: initialUsers[2].username,
			password: initialUsers[2].password,
			password_confirm: initialUsers[2].password,
		})

		// Change first and second user status to 'active'
		await database
			.update(users)
			.set({ status: 'active' })
			.where(
				or(
					eq(users.email, initialUsers[0].email),
					eq(users.email, initialUsers[1].email)
				)
			)
	})

	it('succeeds with valid target username & valid auth token', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { accessToken } = testUserResponse.body ?? undefined
		assert(accessToken)

		const targetUsers = await database
			.select()
			.from(users)
			.where(eq(users.email, initialUsers[1].email))
		const targetUser = targetUsers[0]
		assert(targetUser)

		const requestResult = await api
			.post('/api/friends/request')
			.set('Authorization', 'Bearer ' + accessToken)
			.send({ target_username: targetUser.username })
		const { uid1, uid2, status } = requestResult.body

		assert(uid1)
		assert.equal(uid2, targetUser.id)
		assert.equal(status, 'req_uid1')
	})

	it('fails if target user status is not active', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { accessToken } = testUserResponse.body ?? undefined
		assert(accessToken)

		const [targetUser] = await database
			.select()
			.from(users)
			.where(eq(users.email, initialUsers[2].email))
		assert(targetUser)

		const requestResult = await api
			.post('/api/friends/request')
			.set('Authorization', 'bearer ' + accessToken)
			.send({ target_user_id: targetUser.id })
		const { errors } = requestResult.body

		assert.equal(requestResult.status, 400)
		assert(errors)
	})

	after(async () => {
		await database.delete(friends)
	})
})
