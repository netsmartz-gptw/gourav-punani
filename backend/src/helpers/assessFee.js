const { v4: uuidv4 } = require('uuid');
const axiosInstance = require('./axiosInstance');

/**
 * Fetch account balance from Galileo
 * 
 * @param {String} accountNo 
 * @param {String} type 
 * @returns {Object}
 */
const assessFee = async (accountNo, type) => {

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
        encodedParams.set('type', type)

        console.log(encodedParams)

        const galileoResponse = await axiosInstance.post('assessFee', encodedParams)
        return {
            ...galileoResponse.data,
            accountNo
        }
    }
    catch(err){
        throw err
    }
}

module.exports = assessFee