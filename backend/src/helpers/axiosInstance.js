const axios = require("axios");
require('dotenv').config({path:`${__dirname}/../../.env`})

const axiosInstance = axios.create({
	baseURL: process.env.GALILEO_BASE_URL,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded',
		'response-content-type': 'json'
	},
});
module.exports =  axiosInstance;