const { v4: uuidv4 } = require('uuid');
const axiosInstance  = require("./axiosInstance");

/**
 * Used to retrieve the account features that are set for the specified Galielo account.
 * 
 * @param {String} accountNumber 
 * @returns {Object}
 */
const getAccountFeature = async (accountNumber) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4();
		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('accountNo', accountNumber);

		const galileoResponse = await axiosInstance.post('getAccountFeatures', encodedParams);
		return galileoResponse?.data;
	} catch (error) {
		throw error;
	}
}

module.exports = getAccountFeature;