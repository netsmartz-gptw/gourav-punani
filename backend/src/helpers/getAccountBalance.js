const { v4: uuidv4 } = require('uuid');
const axiosInstance = require('./axiosInstance');

/**
 * Fetch account balance from Galileo
 * 
 * @param {String} accountNo 
 * @returns {Object}
 */
const getAccountBalance = async (accountNo) => {

    try{

        const transactionId = uuidv4()
        
        // env variable for galileo apiLogin, apiTransKey, apiProviderId
        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env
        
        const encodedParams = new URLSearchParams();
        encodedParams.set('apiLogin',  GALILEO_API_LOGIN)
        encodedParams.set('apiTransKey',  GALILEO_API_TRANS_KEY)
        encodedParams.set('providerId', GALILEO_PROVIDER_ID)
        encodedParams.set('transactionId', transactionId)
        encodedParams.set('accountNo', accountNo)

        const galileoResponse = await axiosInstance.post('getBalance', encodedParams)
        return {
            ...galileoResponse.data,
            accountNo
        }
    }
    catch(err){
        throw err
    }
}

module.exports = getAccountBalance