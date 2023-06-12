const { v4: uuidv4 } = require('uuid');
const axiosInstance = require('./axiosInstance');

/**
 * Galileo API to transfer from one account to another
 * 
 * @param {String} fromAccount 
 * @param {String} toAccount 
 * @param {Number} amount 
 * @param {String} message 
 * @returns {Object} Galileo response
 */
const galileoAccountTransfer = (fromAccount, toAccount, amount, message = '') => {

	try {
		const transactionId = uuidv4()
		
		// env variable for galileo apiLogin, apiTransKey, apiProviderId
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env
		
		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin',  GALILEO_API_LOGIN)
		encodedParams.set('apiTransKey',  GALILEO_API_TRANS_KEY)
		encodedParams.set('providerId', GALILEO_PROVIDER_ID)
		encodedParams.set('transactionId', transactionId)

		// payload dependent params 
		encodedParams.set('accountNo', fromAccount)
		encodedParams.set('amount', amount)
		encodedParams.set('transferToAccountNo', toAccount)
		if (message) { encodedParams.set('message', message) }

		return axiosInstance.post('createAccountTransfer', encodedParams);
	
	} catch (error) {
		throw error
	}
}

module.exports = galileoAccountTransfer