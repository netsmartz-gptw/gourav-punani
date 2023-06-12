const {
    CARD_LOCK_UPDATED,
    CARD_UNLOCK_UPDATED
} = require("../../config/messages")
const {
    ErrorHandler,
    jsonResponse,
    modifyCardStatus,
} = require("../../helpers");
const { FREEZE_CARD_TYPE, UNFREEZE_CARD_TYPE } = require("../../config/galileoConfig");

/**
 * Lock / unlock card for child's account
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const lockUnlockCard = async (req, res, next) => {
    try {
        const status = req.params.status;
        const childWallet = req.childWallet;
        
        const freezeCard = status == "true" ? true : false;
        const statusType = freezeCard ? FREEZE_CARD_TYPE : UNFREEZE_CARD_TYPE;

		const featureResponse = await modifyCardStatus(childWallet?.pmt_ref_no, childWallet?.lastFourDigits, statusType, freezeCard);

        return jsonResponse(res, 200, freezeCard ? CARD_LOCK_UPDATED : CARD_UNLOCK_UPDATED, featureResponse);

    } catch (error) {
        return next(new ErrorHandler(500, null, null, error))
    }
}

module.exports = lockUnlockCard;