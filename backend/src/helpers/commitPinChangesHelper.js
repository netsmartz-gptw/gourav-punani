const { v4: uuidv4 } = require('uuid');
const db = require('../mysql/models');
const axiosInstance = require("./axiosInstance");
const { userAccount, userConfig } = require("../modals");
const { ErrorHandler } = require("./errorHandler")

const CommitPinChanges = async (req, res, next) => {
    try {
        const {uid} = req.body

        const userAcc = await userAccount.findOne({
            uid,
            accountType: "spending"
        }).select(["card_id"]).lean()
        console.log(userAcc)


        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
        const transactionId = uuidv4();
        const encodedParams = new URLSearchParams();
        encodedParams.set('apiLogin', GALILEO_API_LOGIN);
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
        encodedParams.set('providerId', GALILEO_PROVIDER_ID);
        encodedParams.set('transactionId', transactionId);
        encodedParams.set('accountNo', userAcc.card_id);
       

        console.log(encodedParams)

        const galileoResponse = await axiosInstance.post('commitCardPinChange', encodedParams);

        return res.status(200).send({
            statusCode: 200,
            response: {
                data: galileoResponse.data
            }
        })

    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }

}

module.exports = CommitPinChanges;