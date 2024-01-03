import { serial, mysqlTable, varchar, bigint } from 'drizzle-orm/mysql-core'
import { UserSchema } from './user.schema'

export const ChannelSchema = mysqlTable('channels', {
	id: serial('id'),
	title: varchar('title', { length: 50 }).notNull(),
	description: varchar('description', { length: 100 }).notNull(),
	ownerId: bigint('owner_id', { mode: 'number', unsigned: true })
		.references(() => UserSchema.id)
		.notNull(),
})
