const axios = require('axios');
const { apiurls } = require('../../config/config');
const getServiceUrl = require('../serviceUrls');

/**
 * Call create notification micro-service 1 API
 * 
 * @param {Object} req 
 * @param {Array} notifications 
*/
const createNotifications = async (req, notifications) => {

    try {
        const baseUrl = await getServiceUrl(req, 'users');
        if (!baseUrl) throw new Error('baseUrl not found');

        const config = {
            method: apiurls.createNotifications.method,
            url: `${baseUrl}/${apiurls.createNotifications.url}`,
            headers: {
                apikey: process.env.NODE_API_KEY,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ notifications })
        };

        return axios(config)

    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = createNotifications