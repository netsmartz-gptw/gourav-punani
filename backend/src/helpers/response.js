/**
 * Common JSON response
 * 
 * @param {Object} res 
 * @param {Number} statusCode 
 * @param {String} message 
 * @param {Object} data 
 * @param {String} code 
 * @returns {JSON}
 */
const jsonResponse = (res, statusCode = 200, message, data = {}, code = '') => {
    return res.status(statusCode).send({
        statusCode,
        response: {
            message,
            data,
            code: code ? code : undefined
        }
    })
}

module.exports = jsonResponse