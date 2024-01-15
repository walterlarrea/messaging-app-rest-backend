import { mysqlTable, bigint } from 'drizzle-orm/mysql-core'
import { users } from './user.schema'
import { channels } from './channel.schema'

export const userChannels = mysqlTable('user_channels', {
	userId: bigint('user_id', { mode: 'number', unsigned: true })
		.references(() => users.id)
		.notNull(),
	channelId: bigint('channel_id', { mode: 'number', unsigned: true })
		.references(() => channels.id)
		.notNull(),
})
