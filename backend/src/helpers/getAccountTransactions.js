const { v4: uuidv4 } = require('uuid')
const axiosInstance = require('./axiosInstance')
const moment = require('moment')

/**
 * Get account transaction from Galileo
 * 
 * @param {String} accountNo 
 * @param {Number} page 
 * @param {Number} recordCnt 
 * @returns {Object}
 */
const getAccountTransactions = async (accountNo, page, recordCnt) => {

    try {

        const transactionId = uuidv4()

        const startDate = moment().add(-30,'days').format('YYYY-MM-DD')
        const endDate = moment().add(1, 'days').format('YYYY-MM-DD')
        
        // env variable for galileo apiLogin, apiTransKey, apiProviderId
        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env

        const encodedParams = new URLSearchParams();
        encodedParams.set('apiLogin', GALILEO_API_LOGIN);
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
        encodedParams.set('providerId', GALILEO_PROVIDER_ID);
        encodedParams.set('transactionId', transactionId);
        encodedParams.set('accountNo', accountNo);
        encodedParams.set('startDate', startDate);
        encodedParams.set('endDate', endDate);
        page ? encodedParams.set('page', page) : encodedParams.set('page', 1);
        if(recordCnt) encodedParams.set('recordCnt', recordCnt)
      
        const galileoResponse =  await axiosInstance.post('getTransHistory', encodedParams)
        return {
           ... galileoResponse.data
        }
    }
    catch(err) {
        throw err
    }
}

module.exports = getAccountTransactions