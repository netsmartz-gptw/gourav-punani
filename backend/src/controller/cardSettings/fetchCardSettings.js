const {
    CHILD_ACCOUNT_NOT_FOUND,
    CHILD_ACCOUNT_NOT_FOUND_EXCEPTION,
    GET_CARD_SETTINGS,
    WRONG_CHILD
} = require("../../config/messages")
const {
    ErrorHandler,
    jsonResponse,
    getAccountFeature,
    verifyParentChild,
    getCardInfo,
    getAccountCards,
    getUserConfig
} = require("../../helpers");
const {
    LOST_WITH_REPLACEMENT_STATUS,
    LOST_WITHOUT_REPLACEMENT_STATUS,
    INTERNATIONAL_TRANSACTION_FEATURE_TYPE
 } = require("../../config/galileoConfig");
const { userAccount } = require("../../modals");

const lostCardStatus = [LOST_WITH_REPLACEMENT_STATUS, LOST_WITHOUT_REPLACEMENT_STATUS];

/**
 * Fetch child card settings (Parent access)
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const fetchCardSettings = async (req, res, next) => {
    try {
        const uid = req.body.uid;
        const childuid = req.params.childuid;

        /* Fetch child information from childUid and check have valid parent */
		const user = await verifyParentChild(childuid, uid);
		if (!user?.id) return jsonResponse(res, 400, WRONG_CHILD);

        // Fetch child's wallet details from user account  
        const childWallet = await userAccount.findOne({
            uid: childuid,
            accountType: 'spending'
        }).select(["uid", "pmt_ref_no", "accountType", "card_id", "card_number"]).exec();
		if (!childWallet?.pmt_ref_no) return jsonResponse(res, 400, CHILD_ACCOUNT_NOT_FOUND, {}, CHILD_ACCOUNT_NOT_FOUND_EXCEPTION);

		const featureResponse = await getAccountFeature(childWallet?.pmt_ref_no);
		const cardInfo = await getCardInfo(childWallet?.card_id);
		// const accountCards = await getAccountCards(childWallet?.pmt_ref_no);
        const userConfig = await getUserConfig(req, childuid);

        const allowTransferFromSaving = userConfig[0] && userConfig[0].cardSettings ? userConfig[0].cardSettings?.savingTransfer : true;
        const cardReportedLost = userConfig.length && lostCardStatus.includes(userConfig[0].physicalCardStatus) ? userConfig[0].physicalCardStatus : false;
  
        let internationalAccessAllowed = false;
        if (featureResponse?.status_code === 0 && featureResponse?.response_data?.features) {
            const internationalFeature = featureResponse.response_data.features.find(feature => feature.type === INTERNATIONAL_TRANSACTION_FEATURE_TYPE);
            internationalAccessAllowed = internationalFeature?.value === 'Y' ? true : false;
        }
        const isCardLocked = (cardInfo?.status_code === 0 && cardInfo?.response_data?.freeze_info?.status === "Frozen") ? true : false;

        return jsonResponse(res, 200, GET_CARD_SETTINGS, {
            allowTransferFromSaving,
            cardReportedLost,
            internationalAccessAllowed,
            isCardLocked,
            // featureResponse,
            // cardInfo,
            // childWallet,
            // userConfig
            // accountCards,
        });

    } catch (error) {
        return next(new ErrorHandler(500, null, null, error))
    }
}

module.exports = fetchCardSettings;