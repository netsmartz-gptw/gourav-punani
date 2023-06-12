const db = require("../mysql/models/index");
const { FORBIDDEN_ACCESS, FORBIDDEN_ACCESS_EXCEPTION } = require('../config/messages');
const { ErrorHandler, jsonResponse } = require('../helpers');

const validRoles = ['child'];

/**
 * Check if user have the permission to access the API
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const childRole = async (req, res, next) => {
	const uid = req.body.uid;
	try {
		const roleDetails = await db.role.findOne({
			attributes: ['id', 'role'],
			include: {
				model: db.Users,
				requred: true,
				where: { uid },
				attributes: ['uid']
			},
            logging: false
		});
		if (!roleDetails || !roleDetails.role || !validRoles.includes(roleDetails.role))
			return jsonResponse(res, 403, FORBIDDEN_ACCESS, null, FORBIDDEN_ACCESS_EXCEPTION)
		
		return next()
	} catch (error) {
		return next(new ErrorHandler(500, null, null, error));		
	}
}

module.exports = childRole;