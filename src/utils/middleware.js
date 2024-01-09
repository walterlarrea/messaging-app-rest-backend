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

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization')

	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		req.token = authorization.substring(7)
	}

	next()
}

const userExtractor = (req, res, next) => {
	const authorization = req.get('authorization')

	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		jwt.verify(req.token, JWT_SECRET, (err, decodedToken) => {
			if (err) return res.sendStatus(403)
			req.user = {
				username: decodedToken.username,
				id: decodedToken.id.toString(),
			}
			next()
		})
	}
}

export default {
	requestLogger,
	unknownEndpoint,
	tokenExtractor,
	userExtractor,
	credentials,
}
