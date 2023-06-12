const { ErrorHandler } = require('../../helpers');
const client = require('./config')

/**
 * Create token from plaid api
 * 
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Function} next
 * @returns {JSON}
 */
const createToken = async (req, res, next) => {

    // genrate request payload
    const request = {
        user: {
            client_user_id: req.body.uid,
        },
        client_name: 'Plaid Test App',
        products: ['auth'],
        language: 'en',
        country_codes: ['US']
    }

    // calll create token method from plaid node sdk and return the token object
    try {
        const createTokenResponse = await client.linkTokenCreate(request)
        return res.status(200).send({
            statusCode: 200,
            response: createTokenResponse.data
        })
    } catch (error) {
        return next(new ErrorHandler(500, null, null, error))
    }

}

module.exports = createToken