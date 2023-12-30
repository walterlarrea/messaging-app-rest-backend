import {
	MYSQL_USER,
	MYSQL_PASSWORD,
	MYSQL_DATABASE,
	MYSQL_URI,
	MYSQL_PORT,
} from '../constants/config.js'

export const sessionCredentials = {
	host: MYSQL_URI,
	port: MYSQL_PORT,
	user: MYSQL_USER,
	password: MYSQL_PASSWORD,
}

export const databaseName = MYSQL_DATABASE
