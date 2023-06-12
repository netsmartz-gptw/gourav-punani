const { WRONG_CHILD, CHILD_ACCOUNT_NOT_FOUND, CHILD_ACCOUNT_NOT_FOUND_EXCEPTION } = require('../config/messages');
const { ErrorHandler, verifyParentChild, jsonResponse } = require('../helpers');
const { userAccount } = require("../modals");


/**
 * Check if user have the permission to access the API
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const cardSettingsAuth = async (req, res, next) => {
	const { uid, childUid } = req.body;
	try {

		/* Fetch child information from childUid and check have valid parent */
		const user = await verifyParentChild(childUid, uid);
		if (!user?.id) return jsonResponse(res, 400, WRONG_CHILD);

		// Fetch child's wallet details from user account  
		const childWallet = await userAccount.findOne({
			uid: childUid,
			accountType: 'spending'
		}).select(["uid", "pmt_ref_no", "accountType", "card_id", "card_number"]).lean();
		if (!childWallet?.pmt_ref_no) return jsonResponse(res, 400, CHILD_ACCOUNT_NOT_FOUND, {}, CHILD_ACCOUNT_NOT_FOUND_EXCEPTION);

		const lastFourDigits = childWallet?.card_number ? childWallet.card_number.substring(childWallet.card_number.length - 4) : null;
		req.childWallet = { ...childWallet, lastFourDigits };
		
		return next()
	} catch (error) {
		return next(new ErrorHandler(500, null, null, error));		
	}
}

module.exports = cardSettingsAuth;