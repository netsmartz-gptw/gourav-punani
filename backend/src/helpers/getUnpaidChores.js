const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Fetch unpaid chores from chores micro-service 2
 * 
 * @param {String} uid 
 * @returns {Object}
 */
const getUnpaidChores = async (req, uid) => {

	try {
		const baseUrl = await getServiceUrl(req, 'chores')
		if(!baseUrl) return null
	
		const headers = {
			// 'accesstoken': req.headers?.accesstoken
		}
	
		const response = await axios.get(`${baseUrl}/unpaid/${uid}`, { headers })

		return response?.data?.response?.unpaidChores;

	} catch (error) {
		throw error
	}

}

module.exports = getUnpaidChores