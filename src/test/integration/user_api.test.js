import { describe, it, before, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers, initialChannels } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { channels } from '../../db/schema/channel.schema.js'
import { eq, or } from 'drizzle-orm'
import { friends } from '../../db/schema/friend.schema.js'

const api = supertest(app)
const [database] = await getDatabase()

describe('Retrieve users data', async () => {
	before(async () => {
		await database.delete(users)

		await database.insert(users).values([
			{
				email: initialUsers[0].email,
				firstName: initialUsers[0].firstName,
				lastName: initialUsers[0].lastName || '',
				username: initialUsers[0].username,
				password: initialUsers[0].password,
				userType: 'user',
				status: 'inactive',
			},
			{
				email: initialUsers[1].email,
				firstName: initialUsers[1].firstName,
				lastName: initialUsers[1].lastName || '',
				username: initialUsers[1].username,
				password: initialUsers[1].password,
				userType: 'user',
				status: 'inactive',
			},
		])
	})

	it('returns all registered users as json', async () => {
		const response = await api.get('/api/user')

		assert.strictEqual(response.status, 200)
		assert.match(response.headers['content-type'], /application\/json/)
		assert.equal(response.body.length, 2)
	})
})

describe('Registering new users', async () => {
	beforeEach(async () => {
		const testUser = initialUsers[1]

		await database.delete(users)

		await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
	})

	it('succeeds providing only email, name, username, pwd & pwd confirmation', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
		const newUserId = testUserResponse?.body?.userId

		const result = await database.select().from(users)

		const createdUser = result.find((user) => user.id === newUserId)

		assert.strictEqual(testUserResponse.status, 201)
		assert(newUserId > 0)
		assert(createdUser)
	})

	it('fails if email is not provided', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/user').send({
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const result = await database.select().from(users)

		const createdUser = result.find(
			(user) => user.username === testUser.username
		)

		assert.strictEqual(testUserResponse.status, 422)
		assert.ifError(createdUser)
	})

	it('fails if username is not provided', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const result = await database.select().from(users)

		const createdUser = result.find((user) => user.email === testUser.email)

		assert.strictEqual(testUserResponse.status, 422)
		assert.ifError(createdUser)
	})

	it('fails if email is already registered', async () => {
		const testUser = initialUsers[1]
		const testUsername = 'test' + testUser.username

		const testUserResponse = await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUsername,
			// Creating different username to keep test on email only
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const result = await database.select().from(users)

		const createdUser = result.find((user) => user.username === testUsername)

		assert.strictEqual(testUserResponse.status, 400)
		assert.ifError(createdUser)
	})

	it('fails if username is already registered', async () => {
		const testUser = initialUsers[1]
		const testEmail = 'test' + testUser.email

		const testUserResponse = await api.post('/api/user').send({
			email: testEmail,
			// Creating different email to keep test on username only
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const result = await database.select().from(users)

		const createdUser = result.find((user) => user.email === testEmail)

		assert.strictEqual(testUserResponse.status, 400)
		assert.ifError(createdUser)
	})
})

//// TESTS BEYOND THIS POINT SHOULD LIVE MULTIPLE FILES, THIS IS A BUG REPORTED.

describe('Login user', async () => {
	before(async () => {
		const testUser = initialUsers[0]

		await database.delete(users)

		await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
	})

	it('succeeds providing only email & password', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/login').send({
			email: testUser.email,
			password: testUser.password,
		})

		const { token, firstName, username } = testUserResponse.body ?? {}

		assert.strictEqual(testUserResponse.status, 200)
		assert.match(testUserResponse.headers['content-type'], /application\/json/)
		assert(token)
		assert(firstName)
		assert(username)
	})
})

describe('Working with channels', async () => {
	before(async () => {
		await database.delete(channels)
		await database.delete(users)

		const testUser = initialUsers[0]

		await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
	})

	beforeEach(async () => {
		await database.delete(channels)
	})

	it('succeeds creating a new channel with valid data and auth token', async () => {
		const testUser = initialUsers[0]

		const loginResponse = await api.post('/api/login').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { token } = loginResponse.body
		assert(token)

		const testChannel = initialChannels[0]
		const testChannelResponse = await api
			.post('/api/channel')
			.set('Authorization', 'bearer ' + token)
			.send({
				title: testChannel.title,
				description: testChannel.description,
			})

		const result = await database.select().from(channels)
		const createdChannel = result.find(
			(channel) => channel.title === testChannel.title
		)

		assert.strictEqual(testChannelResponse.status, 201)
		assert.match(
			testChannelResponse.headers['content-type'],
			/application\/json/
		)
		assert(createdChannel)
	})

	it('succeeds deleting a channel being the owner & with auth token', async () => {
		const testUser = initialUsers[0]

		const loginResponse = await api.post('/api/login').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { token } = loginResponse.body
		assert(token)

		const testChannel = initialChannels[0]
		const testChannelResponse = await api
			.post('/api/channel')
			.set('Authorization', 'bearer ' + token)
			.send({
				title: testChannel.title,
				description: testChannel.description,
			})

		const result = await database.select().from(channels)
		const createdChannel = result.find(
			(channel) => channel.title === testChannel.title
		)

		assert.strictEqual(testChannelResponse.status, 201)
		assert.match(
			testChannelResponse.headers['content-type'],
			/application\/json/
		)
		assert(createdChannel)

		const deleteResult = await api
			.delete(`/api/channel/${createdChannel.id}`)
			.set('Authorization', 'bearer ' + token)

		assert.strictEqual(deleteResult.status, 200)
		assert(deleteResult.msg !== '')
	})

	after(async () => {
		await database.delete(channels)
	})
})

describe('Working with friends requests', async () => {
	before(async () => {
		await database.delete(friends)
		await database.delete(users)

		await api.post('/api/user').send({
			email: initialUsers[0].email,
			first_name: initialUsers[0].firstName,
			last_name: initialUsers[0].lastName || '',
			username: initialUsers[0].username,
			password: initialUsers[0].password,
			password_confirm: initialUsers[0].password,
		})

		await api.post('/api/user').send({
			email: initialUsers[1].email,
			first_name: initialUsers[1].firstName,
			last_name: initialUsers[1].lastName || '',
			username: initialUsers[1].username,
			password: initialUsers[1].password,
			password_confirm: initialUsers[1].password,
		})

		await api.post('/api/user').send({
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

	it('creates friend request with target user & valid auth token', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/login').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { token } = testUserResponse.body ?? undefined
		assert(token)

		const targetUsers = await database
			.select()
			.from(users)
			.where(eq(users.email, initialUsers[1].email))
		const targetUser = targetUsers[0]
		assert(targetUser)

		const requestResult = await api
			.post('/api/friends/request')
			.set('Authorization', 'bearer ' + token)
			.send({ target_user_id: targetUser.id })
		const { uid1, uid2, status } = requestResult.body

		assert(uid1)
		assert.equal(uid2, targetUser.id)
		assert.equal(status, 'req_uid1')
	})

	it('fails friend request if target user is not active', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/login').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { token } = testUserResponse.body ?? undefined
		assert(token)

		const [targetUser] = await database
			.select()
			.from(users)
			.where(eq(users.email, initialUsers[2].email))
		assert(targetUser)

		const requestResult = await api
			.post('/api/friends/request')
			.set('Authorization', 'bearer ' + token)
			.send({ target_user_id: targetUser.id })
		const { error } = requestResult.body

		assert.equal(requestResult.status, 400)
		assert(error)
	})

	after(async () => {
		await database.delete(friends)

		/// Force exit due to Test Runner not able to stop after all test are done
		process.exit()
	})
})
