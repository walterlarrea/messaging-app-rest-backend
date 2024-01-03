import { describe, it, before, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers, initialChannels } from './initial_data.js'
import { responseFormatter } from '../../utils/mySqlHelper.js'

const api = supertest(app)
const [dbConnection] = await getDatabase()
const userTable = dbConnection.getTable('users')
const channelTable = dbConnection.getTable('channels')

describe('Retrieve all users data', async () => {
	before(async () => {
		await userTable.delete().where('id').execute()

		await userTable
			.insert([
				'email',
				'first_name',
				'last_name',
				'username',
				'password',
				'user_type',
				'status',
			])
			.values([
				initialUsers[0].email,
				initialUsers[0].firstName,
				initialUsers[0].lastName || '',
				initialUsers[0].username,
				initialUsers[0].password,
				'user',
				'inactive',
			])
			.values([
				initialUsers[1].email,
				initialUsers[1].firstName,
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

		assert.strictEqual(response.status, 200)
		assert.equal(response.body.length, 2)
	})
})

describe('Registering new users', async () => {
	beforeEach(async () => {
		const testUser = initialUsers[1]

		await userTable.delete().where('id').execute()

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

		const response = await userTable.select().execute()

		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdUser = responseFormatter(columnHeaders, resultData).filter(
			(user) => user.id === newUserId
		)

		assert.strictEqual(testUserResponse.status, 201)
		assert(newUserId > 0)
		assert(createdUser[0])
	})

	it('fails if email is not provided', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/api/user').send({
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})

		const response = await userTable.select().execute()

		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdUser = responseFormatter(columnHeaders, resultData).find(
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

		const response = await userTable.select().execute()

		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdUser = responseFormatter(columnHeaders, resultData).find(
			(user) => user.email === testUser.email
		)

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

		const response = await userTable.select().execute()

		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdUser = responseFormatter(columnHeaders, resultData).find(
			(user) => user.username === testUsername
		)

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

		const response = await userTable.select().execute()
		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdUser = responseFormatter(columnHeaders, resultData).find(
			(user) => user.email === testEmail
		)

		assert.strictEqual(testUserResponse.status, 400)
		assert.ifError(createdUser)
	})
})

//// TESTS BEYOND THIS POINT SHOULD LIVE MULTIPLE FILES, THIS IS A BUG REPORTED.

describe('Login user', async () => {
	before(async () => {
		const testUser = initialUsers[0]

		await userTable.delete().where('id').execute()

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
		await userTable.delete().where('id').execute()
		await channelTable.delete().where('id').execute()
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

		const response = await channelTable.select().execute()

		const resultData = response.fetchAll()
		const columnHeaders = response
			.getColumns()
			.map((col) => col.getColumnName())

		const createdChannel = responseFormatter(columnHeaders, resultData).find(
			(channel) => channel.description === testChannel.description
		)

		assert.strictEqual(testChannelResponse.status, 201)
		assert.match(
			testChannelResponse.headers['content-type'],
			/application\/json/
		)
		assert(createdChannel)
	})

	after(async () => {
		await channelTable.delete().where('id').execute()
	})
})
