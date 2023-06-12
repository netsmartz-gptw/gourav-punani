const { getRoundUp, ErrorHandler } = require("../helpers")

/**
 * 
 * @param {Request Object} req 
 * @param {Responst Object} res 
 * @param {Next middleware} next 
 * @returns JSON response
 */
const getRoundUpAccounts = async (req, res, next) => {

    try {
        const data = await getRoundUp(req.body.uid)
        if (data?.data?.status_code != 0) return next(new ErrorHandler(500))
        
        return res.status(200).send({
            statuscode: 200,
            response: {
                data: data.data
            }
        })
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = getRoundUpAccounts