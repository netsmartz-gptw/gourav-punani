const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Mark learning allowance transactions as paid in chores micro-service 1
 *
 * @param {Array} txnIds
 * @returns {Object}
 */
const markLearningTxnsAsPaid = async (req, txnIds) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users')
		if(!baseUrl) return null
	
		const headers = {
			apikey: process.env.NODE_API_KEY
		};
	
		const response = await axios.put(`${baseUrl}/allowance/paid`, { txnIds }, { headers });
		return response?.data;

	} catch (error) {
		return error
	}
}

module.exports = markLearningTxnsAsPaid