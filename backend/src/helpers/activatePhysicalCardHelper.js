const { v4: uuidv4 } = require('uuid');
const db = require('../mysql/models');
const axiosInstance = require("./axiosInstance");
const { ErrorHandler } = require("./errorHandler")
const { userAccount, userConfig } = require("../modals");
const { CARD_ACTIVATED, cards } = require('../config/messages');
const jsonResponse = require('./response');

const activatePhysicalCard = async (req, res, next) => {
    try {
        const { uid, cardExpiryDate, cardSecurityCode, cardNumberLastFour } = req.body

        const userAcc = await userAccount.findOne({
            uid,
            accountType: "spending"
        }).select(["card_id"]).lean()
        if (!userAcc?.card_id) return jsonResponse(res, 400, cards.not_order_yet)
        const usersConfig = await userConfig.findOne({
            uid,
            physicalCardStatus: "activated"
        }).lean()
        if (usersConfig) return jsonResponse(res, 400, cards.already_activated)

        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
        const transactionId = uuidv4();
        const encodedParams = new URLSearchParams();
        encodedParams.set('apiLogin', GALILEO_API_LOGIN);
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
        encodedParams.set('providerId', GALILEO_PROVIDER_ID);
        encodedParams.set('transactionId', transactionId);
        encodedParams.set('accountNo', userAcc.card_id);
        encodedParams.set('cardExpiryDate', cardExpiryDate);
        encodedParams.set('cardSecurityCode', cardSecurityCode);
        encodedParams.set('cardNumberLastFour', cardNumberLastFour)


        const galileoResponse = await axiosInstance.post('activateCard', encodedParams);
        if (galileoResponse?.data?.status_code !== 0) return next(new ErrorHandler(500, null, null, galileoResponse?.data))

        await userConfig.findOneAndUpdate({ uid: req.body.uid }, { physicalCardStatus: 'activated' });

        return res.status(200).send({
            statusCode: 200,
            response: {
                messages: CARD_ACTIVATED,
                data: galileoResponse.data
            }
        })
    }
    catch (err) {
        console.log("ERROR in activatePhysicalCard : ", err)
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = activatePhysicalCard;