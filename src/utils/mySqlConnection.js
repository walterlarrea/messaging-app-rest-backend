import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

import {
	MYSQL_DATABASE,
	MYSQL_PASSWORD,
	MYSQL_PORT,
	MYSQL_URI,
	MYSQL_USER,
} from '../constants/config.js'

export const getMysqlDatabase = async function () {
	const dbConnection = await mysql.createConnection({
		host: MYSQL_URI,
		port: MYSQL_PORT,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE,
	})

	const database = drizzle(dbConnection)

	const closeConnection = async () => {
		await dbConnection.end()
	}

	return [database, closeConnection]
}
