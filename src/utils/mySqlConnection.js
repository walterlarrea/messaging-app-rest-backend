import mysqlx from '@mysql/xdevapi'
import { sessionCredentials, databaseName } from './mysqlCredentials.js'

export const getSession = async function () {
	const mySession = await mysqlx.getSession(sessionCredentials)

	return [mySession, mySession.close]
}

export const getDatabase = async function () {
	const mySession = await mysqlx.getSession(sessionCredentials)
	const myDb = mySession.getSchema(databaseName)

	return [myDb, mySession.close]
}

export const getDatabaseTable = async function (table) {
	const mySession = await mysqlx.getSession(sessionCredentials)
	const myDb = mySession.getSchema(databaseName)

	return [myDb.getTable(table), mySession.close]
}
