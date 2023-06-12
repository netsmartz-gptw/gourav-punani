const axiosInstance = require("../axiosInstance")
const { v4: uuidv4 } = require('uuid')

const getAuthControl = async (accountNo) => {
    const transactionId = uuidv4()

    // env variable for galileo apiLogin, apiTransKey, apiProviderId
    const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env

    const encodedParams = new URLSearchParams();
    encodedParams.set('apiLogin', GALILEO_API_LOGIN)
    encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
    encodedParams.set('providerId', GALILEO_PROVIDER_ID)
    encodedParams.set('transactionId', transactionId)
    encodedParams.set('accountNo', accountNo)

    return await axiosInstance.post('getAuthControl', encodedParams)        
}
module.exports = getAuthControl