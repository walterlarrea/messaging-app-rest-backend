import mysqlx from '@mysql/xdevapi'
import mysqlConfig from '../constants/mysqlCredentials.js'

const getSessionTable = async function (table) {
  const mySession = await mysqlx.getSession(mysqlConfig)
  const myDb = mySession.getSchema(mysqlConfig.schema)

  return [myDb.getTable(table), mySession.close]
}

export default getSessionTable