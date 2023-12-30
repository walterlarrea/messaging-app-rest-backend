import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getSession } from '../../utils/mySqlConnection.js'
import { initialUsers, initialChannels } from './initial_data.js'

const api = supertest(app)
const [dbConnection] = await getSession()
const userTable = dbConnection.getTable('users')
const channelTable = dbConnection.getTable('channels')

describe('Retrieve of users data', async () => {
	before(async () => {
		await userTable.delete().where('id').execute()

		await userTable
			.insert([
				'email',
				'name',
				'last_name',
				'username',
				'password',
				'user_type',
				'active',
			])
			.values([
				initialUsers[0].email,
				initialUsers[0].name,
				initialUsers[0].lastName || '',
				initialUsers[0].username,
				initialUsers[0].password,
				'user',
				'inactive',
			])
			.values([
				initialUsers[1].email,
				initialUsers[1].name,
				initialUsers[1].lastName || '',
				initialUsers[1].username,
				initialUsers[1].password,
				'user',
				'inactive',
			])
			.execute()
	})

	it('returns users as json', async () => {
		const response = await api.get('/api/user')

		assert.strictEqual(response.status, 200)
		assert.match(response.headers['content-type'], /application\/json/)
	})

	it('gets all registered users', async () => {
		const response = await api.get('/api/user')

		assert.equal(response.body.length, 2)
	})
})

describe('Registering new users', async () => {
	beforeEach(async () => {
		const testUser = initialUsers[1]

		await userTable.delete().where('id').execute()

		await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
	})

	it('succeeds providing only email, name, username, pwd & pwd confirmation', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
		const newUserId = testUserResponse?.body?.userId

		const response = await userTable
			.select()
			.where('id = :id')
			.bind('id', newUserId)
			.execute()

		assert.strictEqual(response.fetchOne()[0], newUserId)
	})

	it('fails if email is not provided', async () => {
		const testUser = initialUsers[0]
		const postResponse = await api.post('/api/user').send({
			name: testUser.name,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const response = await userTable
			.select()
			.where('username = :username')
			.bind('username', initialUsers[0].username)
			.execute()

		assert.strictEqual(postResponse.status, 422)
		assert.strictEqual(response.fetchOne(), undefined)
	})

	it('fails if username is not provided', async () => {
		const testUser = initialUsers[0]
		const postResponse = await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const response = await userTable
			.select()
			.where('email = :email')
			.bind('email', testUser.email)
			.execute()

		assert.strictEqual(postResponse.status, 422)
		assert.strictEqual(response.fetchOne(), undefined)
	})

	it('fails if email is already registered', async () => {
		const testUser = initialUsers[1]
		const postResponse = await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
			username: 'u' + testUser.username,
			// Creating different username to keep test on email only
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const response = await userTable.select().execute()

		assert.strictEqual(postResponse.status, 400)
		assert.strictEqual(response.fetchAll().length, 1)
	})

	it('fails if username is already registered', async () => {
		const testUser = initialUsers[1]
		const postResponse = await api.post('/api/user').send({
			email: 'u' + testUser.email,
			// Creating different email to keep test on username only
			name: testUser.name,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const response = await userTable.select().execute()

		assert.strictEqual(postResponse.status, 400)
		assert.strictEqual(response.fetchAll().length, 1)
	})
})

//// TESTS BEYOND THIS POINT SHOULD LIVE MULTIPLE FILES, THIS IS A BUG REPORTED.

describe('Login user', async () => {
	before(async () => {
		const testUser = initialUsers[0]

		await userTable.delete().where('id').execute()

		await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
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

		const { token, name, username } = testUserResponse.body ?? {}

		assert(token)
		assert(name)
		assert(username)
	})
})

describe('Creating new channels', async () => {
	before(async () => {
		await userTable.delete().where('id').execute()
		await channelTable.delete().where('id').execute()
	})

	it('succeeds providing only name, description & owner ID', async () => {
		const testUser = initialUsers[0]

		const userResponse = await api.post('/api/user').send({
			email: testUser.email,
			name: testUser.name,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
		const newUserId = userResponse._body.userId

		assert(newUserId)

		const testChannel = initialChannels[0]
		const testChannelResponse = await api.post('/api/channel').send({
			name: testChannel.name,
			description: testChannel.description,
			owner_id: newUserId,
		})
		const newChannelId = testChannelResponse?.body?.channelId

		const response = await channelTable
			.select()
			.where('id = :id')
			.bind('id', newChannelId)
			.execute()

		assert.strictEqual(response.fetchOne()[0], newChannelId)

		await channelTable.delete().where('id').execute()
	})
})
