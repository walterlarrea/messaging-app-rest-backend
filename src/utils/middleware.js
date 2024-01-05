import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/config.js'

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
		const decodedToken = jwt.verify(req.token, JWT_SECRET)

		req.user = {
			username: decodedToken.username,
			id: decodedToken.id.toString(),
		}
	}

	next()
}

export default {
	tokenExtractor,
	userExtractor,
}
