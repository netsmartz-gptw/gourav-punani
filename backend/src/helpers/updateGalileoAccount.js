const { v4: uuidv4 } = require('uuid');
const axiosInstance  = require("./axiosInstance");

/**
 * Used to modify customer profile information in an existing customer record
 * 
 * @param {String} accountNumber 
 * @param {Object} updateParams 
 * @param {Boolean} freezeCard 
 * @returns {Object}
 */
const updateGalileoAccount = async (accountNumber, updateParams = {}, freezeCard = false) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4();
		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('accountNo', accountNumber);

		for (const paramKey in updateParams) {
			if (Object.hasOwnProperty.call(updateParams, paramKey)) {
				const param = updateParams[paramKey];
				encodedParams.set(paramKey, param);				
			}
		}

		const galileoResponse = await axiosInstance.post('updateAccount', encodedParams);
		return galileoResponse?.data;
	} catch (error) {
		throw error;
	}
}

module.exports = updateGalileoAccount;