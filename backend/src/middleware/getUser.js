const { USER_NOT_FOUND } = require("../config/messages");
const { ErrorHandler, jsonResponse } = require("../helpers");
const db = require("../mysql/models/index")

/**
 * Get user details
 */
const getUser = async (req, res, next) => {
    
    const {uid} = req.body

    // find user by uid and attach in body
    const user = await db.Users.findOne({
        where: {
            uid
        },
        include: {
            model: db.role,
            attributes: ['role'],
            required: true
        },
        raw: true,
        nest: true,        
    })
    if(!user) return jsonResponse(res, 400, USER_NOT_FOUND)

    // attach user to body
    req.body.user = user

    next()
}

module.exports = getUser