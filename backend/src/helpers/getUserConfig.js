const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Fetch user configuration from microservice 1
 * 
 * @param {String} uid 
 * @returns {Object}
 */
const getUserConfig = async (req, uid) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users')
		if(!baseUrl) return null
	
		const headers = {
			apikey: process.env.NODE_API_KEY
		}

		headers.childuid = uid
	
		const response = await axios.post(`${baseUrl}/config`, { uids: [uid] }, { headers })
		return response?.data?.response?.data;

	} catch (error) {
		throw error
	}

}

module.exports = getUserConfig;