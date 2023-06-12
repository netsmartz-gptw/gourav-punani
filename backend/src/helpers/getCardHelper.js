const { v4: uuidv4 } = require('uuid');
const db = require('../mysql/models');
const axiosInstance  = require("./axiosInstance");
const getChildUidByParentId = require('./getChildUidByParentId')
const { userAccount } = require("../modals");
const { ErrorHandler } = require('./errorHandler');

const getCard = async (req, res, next)=> {
    try {

        const {uid} = req.body

        const data = await userAccount.findOne({
            uid,
            accountType: "spending"
        })

        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
        const transactionId = uuidv4()
        const encodedParams = new URLSearchParams()
        encodedParams.set('apiLogin', GALILEO_API_LOGIN)
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
        encodedParams.set('providerId', GALILEO_PROVIDER_ID)
        encodedParams.set('transactionId', transactionId)
        encodedParams.set('accountNo', data.card_id)

        const galileoResponse = await axiosInstance.post('getCard', encodedParams);
        console.log(galileoResponse)
        return res.status(200).send({
            statusCode: 200,
            response: {
                 data: galileoResponse.data
            }
        })
    }
    catch(err){
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = getCard;