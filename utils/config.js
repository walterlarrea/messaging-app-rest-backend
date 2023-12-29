const SERVER_PORT = process.env.SERVER_PORT

const JWT_SECRET = process.env.JWT_SECRET

const MYSQL_URI = process.env.MYSQL_URI
const MYSQL_PORT = process.env.MYSQL_PORT
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_DATABASE = process.env.MYSQL_DATABASE

// const MONGODB_URI = process.env.NODE_ENV === 'test'
//   ? process.env.TEST_MONGODB_URI
//   : process.env.MONGODB_URI

export default {
	SERVER_PORT,
	JWT_SECRET,
	MYSQL_URI,
	MYSQL_PORT,
	MYSQL_USER,
	MYSQL_PASSWORD,
	MYSQL_DATABASE,
}
