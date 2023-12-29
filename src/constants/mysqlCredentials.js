import config from '../utils/config.js'

const mysqlConfig = {
	host: config.MYSQL_URI,
	port: config.MYSQL_PORT,
	user: config.MYSQL_USER,
	password: config.MYSQL_PASSWORD,
	schema: config.MYSQL_DATABASE,
}

export default mysqlConfig
