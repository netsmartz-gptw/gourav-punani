const { v4: uuidv4 } = require('uuid')
const axiosInstance = require('./axiosInstance')

/**
 * Add ACH account in Galileo
 * 
 * @param {String} accountNo
 * @param {String} processorToken
 * @returns {Object}
 */
const addAchAccount = async (accountNo, processorToken) => {
    try{

        const transactionId = uuidv4()
        
        // env variable for galileo apiLogin, apiTransKey, apiProviderId
        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env
        
        const encodedParams = new URLSearchParams()

        encodedParams.set('apiLogin',  GALILEO_API_LOGIN)
        encodedParams.set('apiTransKey',  GALILEO_API_TRANS_KEY)
        encodedParams.set('providerId', GALILEO_PROVIDER_ID)
        encodedParams.set('transactionId', transactionId)
        encodedParams.set('accountNo', accountNo)
        encodedParams.set('processorToken', processorToken)

        const galileoResponse = await axiosInstance.post('addAchAccount', encodedParams)
        return {
            ...galileoResponse.data,
            accountNo,
            processorToken
        }
    }
    catch(err){
        throw new Error(err)
    }
}

module.exports = addAchAccount