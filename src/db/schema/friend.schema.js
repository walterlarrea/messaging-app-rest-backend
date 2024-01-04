import {
	mysqlTable,
	mysqlEnum,
	bigint,
	primaryKey,
} from 'drizzle-orm/mysql-core'
import { users } from './user.schema.js'

export const friends = mysqlTable(
	'user_friends',
	{
		uid1: bigint('user_id_1', { mode: 'number', unsigned: true })
			.references(() => users.id)
			.notNull(),
		uid2: bigint('user_id_2', { mode: 'number', unsigned: true })
			.references(() => users.id)
			.notNull(),
		status: mysqlEnum('status', ['req_uid1', 'req_uid2', 'approved']),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.uid1, table.uid2] }),
		}
	}
)
