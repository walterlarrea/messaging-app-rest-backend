import { describe, it, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers, initialChannels } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { channels } from '../../db/schema/channel.schema.js'

const api = supertest(app)
const [database] = await getDatabase()

describe('Creating channels', async () => {
	beforeEach(async () => {
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

	it('succeeds with valid data & valid auth token', async () => {
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

	after(async () => {
		await database.delete(channels)
	})
})

describe('Deleting channels', async () => {
	beforeEach(async () => {
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

	it('succeeds when user is the owner & valid auth token', async () => {
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