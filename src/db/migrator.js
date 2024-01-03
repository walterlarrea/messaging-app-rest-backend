import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'

import {
	MYSQL_DATABASE,
	MYSQL_PASSWORD,
	MYSQL_URI,
	MYSQL_USER,
} from '../constants/config.js'

const doMigrate = async () => {
	try {
		const dbConnection = await mysql.createConnection({
			host: MYSQL_URI,
			user: MYSQL_USER,
			password: MYSQL_PASSWORD,
			database: MYSQL_DATABASE,
			// multipleStatements: true,
		})
		const db = drizzle(dbConnection) // , { schema })

		await migrate(db, {
			migrationsFolder: 'drizzle/migrations',
		})

		dbConnection.end()

		console.log('Migration DONE')
		process.exit(0)
	} catch (error) {
		console.log('ERROR: ', error)
	}
}
doMigrate()
