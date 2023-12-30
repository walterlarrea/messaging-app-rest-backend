import mysqlx from '@mysql/xdevapi'
import mysqlConfig from '../constants/mysqlCredentials.js'

export const getSession = async function () {
	const mySession = await mysqlx.getSession(mysqlConfig)

	return [mySession, mySession.close]
}

export const getDatabase = async function () {
	const mySession = await mysqlx.getSession(mysqlConfig)
	const myDb = mySession.getSchema(mysqlConfig.databaseName)

	return [myDb, mySession.close]
}

export const getDatabaseTable = async function (table) {
	const mySession = await mysqlx.getSession(mysqlConfig)
	const myDb = mySession.getSchema(mysqlConfig.databaseName)

	return [myDb.getTable(table), mySession.close]
}
