const { v4: uuidv4 } = require('uuid');
const axiosInstance  = require("./axiosInstance");

/**
 * Used to set or modify specified attributes of a Galileo account
 * 
 * @param {String} accountNumber 
 * @param {Number} featureType 
 * @param {String} featureValue 
 * @returns {Object}
 */
const setAccountFeature = async (accountNumber, featureType, featureValue) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4();
		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('accountNo', accountNumber)
		encodedParams.set('featureType', featureType);
		encodedParams.set('featureValue', featureValue);

		const galileoResponse = await axiosInstance.post('setAccountFeature', encodedParams);
		return galileoResponse?.data;
	} catch (error) {
		throw error;
	}
}

module.exports = setAccountFeature;