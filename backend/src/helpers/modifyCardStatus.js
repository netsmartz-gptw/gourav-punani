const { v4: uuidv4 } = require('uuid');
const axiosInstance  = require("./axiosInstance");
// const moment = require('moment');

/**
 * Used to change the status of an account, a card, or both
 * 
 * @param {String} accountNumber 
 * @param {String} lastFourDigits 
 * @param {Number} statusType 
 * @param {Boolean} freezeCard 
 * @returns {Object}
 */
const modifyCardStatus = async (accountNumber, lastFourDigits = null, statusType, freezeCard = false) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4();
		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('accountNo', accountNumber)
		encodedParams.set('type', statusType);
		if (lastFourDigits) encodedParams.set('cardNumberLastFour', lastFourDigits);

		if (freezeCard) {
			encodedParams.set('endDate', '3000-01-01 00:00:00');
		}
		// console.log("encodedParams : ", encodedParams);
		const galileoResponse = await axiosInstance.post('modifyStatus', encodedParams);
		return galileoResponse?.data;
	} catch (error) {
		throw error;
	}
}

module.exports = modifyCardStatus;