/* eslint-disable no-undef */

// TEST DATABASE
db.createUser({
	user: 'test_user',
	pwd: 'test',
	roles: [
		{
			role: 'readWrite',
			db: 'test',
		},
	],
})
db.createCollection('user_messages', { capped: false })
db.createCollection('channel_messages', { capped: false })

// PROD DATABASE
production = db.getSiblingDB('production')

production.createUser({
	user: 'prod_user',
	pwd: 'prod',
	roles: [
		{
			role: 'readWrite',
			db: 'production',
		},
	],
})
production.createCollection('user_messages', { capped: false })
production.createCollection('channel_messages', { capped: false })

//DEV DATABASE
development = db.getSiblingDB('development')

development.createUser({
	user: 'dev_user',
	pwd: 'dev',
	roles: [
		{
			role: 'readWrite',
			db: 'development',
		},
	],
})

development.createCollection('user_messages', { capped: false })
development.createCollection('channel_messages', { capped: false })

development.user_messages.insert([
	{
		senderId: 1,
		content: 'How u doing?',
		receivingId: 2,
	},
	{
		senderId: 2,
		content: 'Fine',
		receivingId: 1,
	},
	{
		senderId: 2,
		content: 'And you?',
		receivingId: 1,
	},
])
