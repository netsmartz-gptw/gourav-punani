const { ErrorHandler } = require('../../helpers')
const client = require('./config')

/**
 * Generate public token from plaid
 * 
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Function} next
 * @returns {JSON}
 */
const generatePublicToken = async (req, res, next) => {
    
    const publicTokenRequest = {
        institution_id: "ins_127989",
        initial_products: [
            "assets",
            "auth",
            "balance",
            "transactions",
            "identity"
        ],
    }

    try {

        const publicTokenResponse = await client.sandboxPublicTokenCreate(publicTokenRequest)
        const publicToken = publicTokenResponse.data.public_token

        return res.send(publicToken)
    } catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = generatePublicToken