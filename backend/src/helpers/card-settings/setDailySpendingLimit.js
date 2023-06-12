const axiosInstance = require("../axiosInstance")
const { v4: uuidv4 } = require('uuid')

const setDailySpendingLimit = async (accountNo, controlId, amount) => {
    const transactionId = uuidv4()

    // env variable for galileo apiLogin, apiTransKey, apiProviderId
    const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env

    const encodedParams = new URLSearchParams();
    encodedParams.set('apiLogin', GALILEO_API_LOGIN)
    encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
    encodedParams.set('providerId', GALILEO_PROVIDER_ID)
    encodedParams.set('transactionId', transactionId)
    encodedParams.set('accountNo', accountNo)
    encodedParams.set('controlId', controlId)
    encodedParams.set('amount', amount)

    return await axiosInstance.post('setAccountLevelAuthControl', encodedParams)        
}
module.exports = setDailySpendingLimit