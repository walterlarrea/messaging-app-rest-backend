import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import app from '../app.js'
import getSessionForTable from '../utils/mySqlConnection.js'
import { initialUsers } from './test_initial_data.js'

const api = supertest(app)

describe('Retrieve of users data', async () => {
  before(async () => {
    const [userTable, closeSession] = await getSessionForTable('user')

    await userTable
      .delete()
      .where('id')
      .execute()

    await userTable
      .insert([
        'email',
        'name',
        'last_name',
        'username',
        'password',
        'user_type',
        'active'])
      .values([
        initialUsers[0].email,
        initialUsers[0].name,
        initialUsers[0].last_name || '',
        initialUsers[0].username,
        initialUsers[0].password,
        'user',
        'inactive'])
      .values([
        initialUsers[1].email,
        initialUsers[1].name,
        initialUsers[1].last_name || '',
        initialUsers[1].username,
        initialUsers[1].password,
        'user',
        'inactive'])
      .execute()

    closeSession()
  })

  it('users are returned as json', async () => {
    const response = await api.get('/api/user')

    assert.strictEqual(response.status, 200)
    assert.match(response.headers['content-type'], /application\/json/)
  })

  it('should get all registered users', async () => {
    const response = await api.get('/api/user')

    assert.equal(response.body.length, 2)
  })
})

describe('Registering new users', async () => {
  beforeEach(async () => {
    const [userTable, closeSession] = await getSessionForTable('user')

    await userTable
      .delete()
      .where('id')
      .execute()

    await userTable
      .insert([
        'email',
        'name',
        'last_name',
        'username',
        'password',
        'user_type',
        'active'])
      .values([
        initialUsers[1].email,
        initialUsers[1].name,
        initialUsers[1].last_name || '',
        initialUsers[1].username,
        initialUsers[1].password,
        'user',
        'inactive'])
      .execute()

    closeSession()
  })

  it('succeeds with only email, name, username, pwd & pwd confirmation', async () => {
    const testUserResponse = await api
      .post('/api/user')
      .send({
        email: 'walter@mail.com',
        name: 'Walter',
        username: 'Walli',
        password: '12345678',
        password_confirm: '12345678',
      })
    const newUserId = testUserResponse?.body?.userId

    const [userTable, closeSession] = await getSessionForTable('user')

    const response = await userTable
      .select()
      .where('id = :id')
      .bind('id', newUserId)
      .execute()

    closeSession()

    assert.strictEqual(response.fetchOne()[0], newUserId)
  })

  it('fails if email is not provided', async () => {
    const testUser = initialUsers[0]
    const postResponse = await api
      .post('/api/user')
      .send({
        name: testUser.name,
        username: testUser.username,
        password: testUser.password,
        password_confirm: testUser.password,
      })

    const [userTable, closeSession] = await getSessionForTable('user')

    const response = await userTable
      .select()
      .where('username = :username')
      .bind('username', initialUsers[0].username)
      .execute()

    closeSession()

    assert.strictEqual(postResponse.status, 422)
    assert.strictEqual(response.fetchOne(), undefined)
  })

  it('fails if username is not provided', async () => {
    const testUser = initialUsers[0]
    const postResponse = await api
      .post('/api/user')
      .send({
        email: testUser.email,
        name: testUser.name,
        password: testUser.password,
        password_confirm: testUser.password,
      })

    const [userTable, closeSession] = await getSessionForTable('user')

    const response = await userTable
      .select()
      .where('email = :email')
      .bind('email', testUser.email)
      .execute()

    closeSession()

    assert.strictEqual(postResponse.status, 422)
    assert.strictEqual(response.fetchOne(), undefined)
  })

  it('fails if email is already registered', async () => {
    const testUser = initialUsers[1]
    const postResponse = await api
      .post('/api/user')
      .send({
        email: testUser.email,
        name: testUser.name,
        username: 'u' + testUser.username,
        // Creating different username to keep test on email only
        password: testUser.password,
        password_confirm: testUser.password,
      })

    const [userTable, closeSession] = await getSessionForTable('user')

    const response = await userTable
      .select()
      .execute()

    closeSession()

    assert.strictEqual(postResponse.status, 400)
    assert.strictEqual(response.fetchAll().length, 1)
  })

  it('fails if username is already registered', async () => {
    const testUser = initialUsers[1]
    const postResponse = await api
      .post('/api/user')
      .send({
        email: 'u' + testUser.email,
        // Creating different email to keep test on username only
        name: testUser.name,
        username: testUser.username,
        password: testUser.password,
        password_confirm: testUser.password,
      })

    const [userTable, closeSession] = await getSessionForTable('user')

    const response = await userTable
      .select()
      .execute()

    closeSession()

    assert.strictEqual(postResponse.status, 400)
    assert.strictEqual(response.fetchAll().length, 1)
  })
})