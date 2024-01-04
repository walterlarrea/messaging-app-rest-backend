import { serial, mysqlTable, varchar, bigint } from 'drizzle-orm/mysql-core'
import { users } from './user.schema.js'

export const channels = mysqlTable('channels', {
	id: serial('id'),
	title: varchar('title', { length: 50 }).notNull(),
	description: varchar('description', { length: 100 }).notNull(),
	ownerId: bigint('owner_id', { mode: 'number', unsigned: true })
		.references(() => users.id)
		.notNull(),
})
