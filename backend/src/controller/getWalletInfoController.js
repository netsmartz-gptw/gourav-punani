'use strict';

const { ErrorHandler, jsonResponse } = require('../helpers')
const { userAccount } = require("../modals");
const { ACCOUNT_DETAILS_NOT_FOUND } = require('../config/messages');

/**
 * Fetch wallet information from DB
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const walletInfo = async (req, res, next) => {
    try {

        const { uid } = req.body

        const walletInfo = await userAccount.findOne({
            uid: uid
        }).exec()
        if (!walletInfo) return jsonResponse(res, 400, ACCOUNT_DETAILS_NOT_FOUND)
    
        return res.status(200).send({
            statusCode: 200,
            response: {
                walletInfo
            }
        })

    }
    catch (error) {
        return next(new ErrorHandler(500, null, null, error))
    }
}

module.exports = walletInfo