import { serial, mysqlTable, varchar, mysqlEnum } from 'drizzle-orm/mysql-core'

export const UserSchema = mysqlTable('users', {
	id: serial('id'),
	email: varchar('email', { length: 60 }).notNull(),
	firstName: varchar('first_name', { length: 20 }).notNull(),
	lastName: varchar('last_name', { length: 25 }),
	username: varchar('username', { length: 25 }).notNull(),
	password: varchar('password', { length: 100 }).notNull(),
	userType: mysqlEnum('user_type', ['user', 'administrator', 'manager'])
		.notNull()
		.default('user'),
	status: mysqlEnum('status', ['inactive', 'active', 'deleted'])
		.notNull()
		.default('inactive'),
})
