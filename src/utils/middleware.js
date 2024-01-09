import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/config.js'
import allowedOrigins from '../constants/allowedOrigins.js'
import logger from './logger.js'

const requestLogger = (req, res, next) => {
	logger.info('Method:', req.method)
	logger.info('Path:  ', req.path)
	logger.info('Body:  ', req.body)
	logger.info('---')
	next()
}

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

const credentials = (req, res, next) => {
	const origin = req.headers.origin
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Credentials', true)
	}
	next()
}

const verifyAccessToken = (req, res, next) => {
	const authorization = req.get('authorization')
	if (!authorization) return res.sendStatus(401)

	const accessToken = authorization.split(' ')[1]
	jwt.verify(accessToken, JWT_SECRET, (err, decodedToken) => {
		if (err) return res.sendStatus(403)
		req.user = {
			id: decodedToken.id.toString(),
			username: decodedToken.username,
		}
		next()
	})
}

export default {
	requestLogger,
	unknownEndpoint,
	verifyAccessToken,
	credentials,
}
