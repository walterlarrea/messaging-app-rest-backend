import { describe, it, before, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers, initialChannels } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { channels } from '../../db/schema/channel.schema.js'

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

describe('Creating new channels', async () => {
	before(async () => {
		await database.delete(channels) // channelTable.delete().where('id').execute()
		await database.delete(users) // userTable.delete().where('id').execute()
	})

	it('succeeds providing only name, description & owner ID', async () => {
		const testUser = initialUsers[0]

		const userResponse = await api.post('/api/user').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
		const newUserId = userResponse._body.userId

		assert(newUserId > 0)

		const testChannel = initialChannels[0]
		const testChannelResponse = await api.post('/api/channel').send({
			title: testChannel.title,
			description: testChannel.description,
			owner_id: newUserId,
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

	after(async () => {
		await database.delete(channels)
	})
})
