const axios = require('axios');
const getServiceUrl = require('../serviceUrls');
const { SERVER_ERROR } = require('../../config/messages');

/**
 * Fetch user configuration from microservice 1
 * 
 * @param {String} uid 
 * @returns {Object}
 */
const updateUserConfig = async (req, body) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users')
		if(!baseUrl) throw new Error(SERVER_ERROR)
	
		const headers = {
			accesstoken: req.headers.accesstoken
		}

		const response = await axios.put(`${baseUrl}/config`, {...body}, { headers })
		return response?.data?.response?.data;

	} catch (error) {
		throw error
	}

}

module.exports = updateUserConfig;