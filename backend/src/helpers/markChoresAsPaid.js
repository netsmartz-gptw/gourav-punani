const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Mark chores as paid in chores micro-service 2
 * TODO: Add api key in header
 * @param {Array} choreIds
 * @returns {Object}
 */
const markChoresAsPaid = async (req, choreIds) => {

	try {
		const baseUrl = await getServiceUrl(req, 'chores')
		if(!baseUrl) return null
	
		const headers = {
			// 'accesstoken': req.headers?.accesstoken
		}
	
		const response = await axios.put(`${baseUrl}/mark/paid`, { choreIds }, { headers });
		return response?.data;

	} catch (error) {
		return error
	}
}

module.exports = markChoresAsPaid