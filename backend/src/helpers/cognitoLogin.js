'use strict';

require('dotenv').config()
const axios = require('axios');
const getServiceUrl = require('./serviceUrls')
const { BASE_URL_UNDEFINED } = require('../config/messages')

/**
 * Login for test cases from users micro-service
 * 
 * @param {Object} req 
 * @returns {Object}
 */
const cognitoLogin = async (req) => {

	try {
		const baseUrl = await getServiceUrl(req, 'users');
		if(!baseUrl) throw new Error(BASE_URL_UNDEFINED);

		const payload = {
			username: process.env.JEST_COGNITO_LOGIN_USERNAME,
			password: process.env.JEST_COGNITO_LOGIN_PASSWORD,
		};
	
		const response = await axios.post(baseUrl + '/cognito/login', payload);
		return response?.data?.response;

	} catch (error) {
		throw error;
	}
};

module.exports = cognitoLogin;