const { FORBIDDEN_ACCESS, FORBIDDEN_ACCESS_EXCEPTION, API_KEY_REQUIRED, API_KEY_EXCEPTION } = require("../config/messages");
const { ErrorHandler, jsonResponse } = require("../helpers");

const authKey = async (req, res, next) => {

	try {
		if (!req.headers.apikey) return next(new ErrorHandler(400, API_KEY_REQUIRED, API_KEY_EXCEPTION));

		if (req.headers.apikey !== process.env.NODE_API_KEY)
			return jsonResponse(res, 403, FORBIDDEN_ACCESS, null, FORBIDDEN_ACCESS_EXCEPTION)
		
		return next()
	}
	catch (error) {
		return next(new ErrorHandler(500, null, null, error));
	}
}

module.exports = authKey;