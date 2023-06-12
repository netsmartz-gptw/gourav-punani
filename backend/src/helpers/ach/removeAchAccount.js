const { v4: uuidv4 } = require('uuid');
const axiosInstance = require('../axiosInstance');

/**
 * 
 * @param {*} accountNo 
 * @param {*} achAccountId 
 */
const removeAchAccount = async (accountNo, achAccountId) => {

    const transactionId = uuidv4()

    // env variable for galileo apiLogin, apiTransKey, apiProviderId
    const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env

    const encodedParams = new URLSearchParams();
    encodedParams.set('apiLogin', GALILEO_API_LOGIN)
    encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
    encodedParams.set('providerId', GALILEO_PROVIDER_ID)
    encodedParams.set('transactionId', transactionId)
    encodedParams.set('accountNo', accountNo)
    encodedParams.set('achAccountId', achAccountId)

    return await axiosInstance.post('removeAchAccount', encodedParams)

}
module.exports = removeAchAccount