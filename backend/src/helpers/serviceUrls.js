const urls = require('../config/urls')
const { ENV_NOT_FOUND } = require('../config/messages');

/**
 * Get service URL
 * 
 * @param {String} service
 * @returns {String} url
 */
const getServiceUrl = async (req, service) => {
	try {
		
		const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
		const SERVER_ENVIRONMENT = process.env.SERVER_ENVIRONMENT || 'localhost';
		let host = '';
		if (process.env.NODE_ENV === 'production') {
			if (req && req.get) {
				host = req.get('host')
			} else {
				switch (SERVER_ENVIRONMENT) {
					case 'localhost'	: host = urls?.localhost[service];		break;
					case 'development'	: host = urls?.development[service];	break;
					case 'qa'			: host = urls?.qa[service];				break;
					case 'uat'			: host = urls?.production[service];		break;
					default				: throw new Error(ENV_NOT_FOUND);
				}
				return host;
			}
		} else {
			host = urls?.localhost[service]
		}
		return protocol + '://' + host + '/' + service
	} catch (error) {
		throw error; 
	}
}

module.exports = getServiceUrl