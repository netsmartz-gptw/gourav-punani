const { v4: uuidv4 } = require('uuid');
const db = require('../mysql/models');
const { axiosInstance, ErrorHandler, getUserConfig, jsonResponse } = require("../helpers");
const { userAccount } = require("../modals");
const {
    VIRTUAL_CARD_CV,
    LOST_WITH_REPLACEMENT_STATUS,
    LOST_WITHOUT_REPLACEMENT_STATUS,
} = require("../config/galileoConfig");

/**
 * Fetch image URL of virtual card for Galileo
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const viewVirtualCard = async (req, res, next) => {
    try {
        const { uid } = req.body
        let cardId, cardReportedLost = false;
        const lostCardStatus = [LOST_WITH_REPLACEMENT_STATUS, LOST_WITHOUT_REPLACEMENT_STATUS];

        // fetch role from uid 
        const userRole = await db.Users.findOne({
            where: { uid },
            attributes: ['roleId'],
            include: {
                model: db.role,
                required: true,
                attributes: ['role']
            }
        });
        if (userRole.role.role === 'admin' || userRole.role.role === 'parent') {
            const userAcc = await userAccount.findOne({
                uid,
                accountType: "primary"
            }).select(["uid", "pmt_ref_no", "card_id"]).lean()
            if (!userAcc) return jsonResponse(res, 400, USER_ACC_NOT_FOUND)
            cardId = userAcc.card_id

        }
        else if (userRole.role.role === 'child') {
            const userAcc = await userAccount.findOne({
                uid,
                accountType: "spending"
            }).select(["uid", "pmt_ref_no", "card_id"]).lean()
            if (!userAcc) return jsonResponse(res, 400, USER_ACC_NOT_FOUND)
            cardId = userAcc.card_id
            const userConfig = await getUserConfig(req, uid);
            if (userConfig?.length && lostCardStatus.includes(userConfig[0].physicalCardStatus)) {
                cardReportedLost = userConfig[0].physicalCardStatus;
            }
        }

        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
        const transactionId = uuidv4();
        const encodedParams = new URLSearchParams();
        encodedParams.set('apiLogin', GALILEO_API_LOGIN);
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
        encodedParams.set('providerId', GALILEO_PROVIDER_ID);
        encodedParams.set('transactionId', transactionId);
        encodedParams.set('accountNo', cardId);
        encodedParams.set('type', '0');
        const galileoResponse = await axiosInstance.post('getAccessToken', encodedParams);
        const token = galileoResponse.data.response_data.token
        const imageURL = VIRTUAL_CARD_CV(token);


        return res.status(200).send({
            statusCode: 200,
            response: {
                imageUrl: imageURL,
                cardReportedLost
            }
        })
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}


module.exports = viewVirtualCard;