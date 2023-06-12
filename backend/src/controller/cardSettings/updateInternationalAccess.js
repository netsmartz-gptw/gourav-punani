const { INTERNATIONAL_TXNS_UPDATED } = require("../../config/messages")
const {
    ErrorHandler,
    setAccountFeature,
    jsonResponse,
} = require("../../helpers");
const { INTERNATIONAL_TRANSACTION_FEATURE_TYPE } = require("../../config/galileoConfig");

/**
 * Enable / disable international transacation for child's account
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const updateInternationalAccess = async (req, res, next) => {
    try {
        const status = req.params.status;
        const childWallet = req.childWallet;
        
        const featureValue = status == "true" ? "Y" : "N";

		const featureResponse = await setAccountFeature(childWallet?.pmt_ref_no, INTERNATIONAL_TRANSACTION_FEATURE_TYPE, featureValue );

        return jsonResponse(res, 200, INTERNATIONAL_TXNS_UPDATED);

    } catch (error) {
        return next(new ErrorHandler(500, null, null, error))
    }
}

module.exports = updateInternationalAccess;