const axios = require('axios');
const getServiceUrl = require('./serviceUrls')

/**
 * Set user configuration from microservice 1
 * 
 * @param {Object} req 
 * @param {Object} fields 
 * @param {String} childUid 
 * @param {Boolean} isAdmin 
 * @returns {Object}
 */
const setUserConfig = async (req, fields, childUid, isAdmin = false) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users');
		if(!baseUrl) return null;
	
		let headers = {};
		if (isAdmin) headers = { ...headers, apikey: process.env.NODE_API_KEY };
		else headers = { ...headers, accesstoken: req.headers.accesstoken };
      
    if (childUid) headers.childuid = childUid;
		
		const url = isAdmin ? `${baseUrl}/admin/config` : `${baseUrl}/config`;
		let putData = { fields };
		if (isAdmin) putData = { ...putData, uid: childUid };

		const response = await axios.put(url, putData, { headers });
		return response?.data;

	} catch (error) {
		throw error
	}
}

module.exports = setUserConfig;