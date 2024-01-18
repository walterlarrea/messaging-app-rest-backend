export const SERVER_PORT = process.env.SERVER_PORT
export const JWT_SECRET = process.env.JWT_SECRET

export const MYSQL_URI = process.env.MYSQL_URI
export const MYSQL_PORT = process.env.MYSQL_PORT
export const MYSQL_USER = process.env.MYSQL_USER
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
export const MYSQL_DATABASE = process.env.MYSQL_DATABASE

export const MONGODB_URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`
