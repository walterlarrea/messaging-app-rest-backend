import { describe, it, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../../../app.js'
import { getDatabase } from '../../utils/mySqlConnection.js'
import { initialUsers } from './initial_data.js'
import { users } from '../../db/schema/user.schema.js'
import { eq, or } from 'drizzle-orm'

const api = supertest(app)
const [database] = await getDatabase()

describe('Retrieve users data', async () => {
	beforeEach(async () => {
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

		await database
			.update(users)
			.set({ status: 'active' })
			.where(or(eq(users.email, initialUsers[0].email)))
	})

	it('returns all registered users as json', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/auth').send({
			email: testUser.email,
			password: testUser.password,
		})
		const { accessToken } = testUserResponse.body ?? undefined
		assert(accessToken)

		const response = await api
			.get('/api/user')
			.set('Authorization', 'Bearer ' + accessToken)

		assert.strictEqual(response.status, 200)
		assert.match(response.headers['content-type'], /application\/json/)
		assert.equal(response.body.length, 2)
	})

	after(async () => {
		await database.delete(users)
	})
})

describe('Registering new users', async () => {
	beforeEach(async () => {
		const testUser = initialUsers[1]

		await database.delete(users)

		await api.post('/register').send({
			email: testUser.email,
			first_name: testUser.firstName,
			username: testUser.username,
			password: testUser.password,
			password_confirm: testUser.password,
		})
	})

	it('succeeds providing only email, name, username, pwd & pwd confirmation', async () => {
		const testUser = initialUsers[0]
		const testUserResponse = await api.post('/register').send({
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
		const testUserResponse = await api.post('/register').send({
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
		const testUserResponse = await api.post('/register').send({
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

		const testUserResponse = await api.post('/register').send({
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

		const testUserResponse = await api.post('/register').send({
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

	after(async () => {
		await database.delete(users)
	})
})
