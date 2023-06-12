const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Fetch learning allowance transactions from chores micro-service 1
 * 
 * @param {String} uid 
 * @returns {Object}
 */
const fetchLearningTransactions = async (req, filter) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users');
		if(!baseUrl) return null;
	
		const headers = {
			apikey: process.env.NODE_API_KEY
		};
	
		const response = await axios.post(`${baseUrl}/allowance/transaction`, filter, { headers });
		return response?.data?.response?.allowanceTransaction;

	} catch (error) {
		throw error;
	}
}

module.exports = fetchLearningTransactions;