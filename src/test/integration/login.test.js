import { describe, it, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getMysqlDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { channels } from '../../db/schema/channel.schema.js'
import { friends } from '../../db/schema/friend.schema.js'
import { eq } from 'drizzle-orm'

const api = supertest(app)
const [database] = await getMysqlDatabase()

describe('Login user', async () => {
	beforeEach(async () => {
		const testUser = initialUsers[0]

		await database.delete(channels)
		await database.delete(friends)
		await database.delete(users)

		const response = await api.post('/register').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		await database
			.update(users)
			.set({ status: 'active' })
			.where(eq(users.id, response?.body?.userId))
	})

	it('succeeds providing only email & password', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: testUser.password,
		})

		const { accessToken, role } = testUserResponse.body ?? {}

		assert.strictEqual(testUserResponse.status, 200)
		assert.match(testUserResponse.headers['content-type'], /application\/json/)
		assert(accessToken)
		assert(role)
	})

	it('fails with non registered email', async () => {
		const testUser = initialUsers[1]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: testUser.password,
		})

		const { accessToken, role } = testUserResponse.body ?? {}

		assert.strictEqual(testUserResponse.status, 400)
		assert(!accessToken)
		assert(!role)
	})

	after(async () => {
		await database.delete(users)
	})

	it('fails with existent mail but wrong password', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: 'IncorrectPass123',
		})

		const { accessToken, role } = testUserResponse.body ?? {}

		assert.strictEqual(testUserResponse.status, 400)
		assert(!accessToken)
		assert(!role)
	})

	after(async () => {
		await database.delete(users)
	})
})
