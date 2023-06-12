const jwt = require('jsonwebtoken');
const { ErrorHandler, jsonResponse } = require('../helpers');
const { ACCESS_TOKEN_EXPIRED, NOT_AUTHORIZED_EXCEPTION } = require('../config/messages');

/**
 * Middleware for webhook JWT authentication
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const webhookAuth = async (req, res, next) => {
	try {
		const userId = req.headers["User-ID"] || req.headers["user-id"];
		let token = req.headers['Authorization'] || req.headers['authorization']; // Express headers are auto converted to lowercase
		if (token?.startsWith('Bearer ')) {
			token = token ? token.split(" ")[1] : '';
		}
		jwt.verify(token, process.env.GALILEO_SECRET_KEY, {
			issuer: userId,
			algorithms: ["HS256"]
		}, async (err, decodedToken) => {
			if(err) return jsonResponse(res, 400, ACCESS_TOKEN_EXPIRED, null, NOT_AUTHORIZED_EXCEPTION)
			return next()
		});
	} catch (error) {
		return next(new ErrorHandler(500, null, null, error));
	}
}

module.exports = webhookAuth;
