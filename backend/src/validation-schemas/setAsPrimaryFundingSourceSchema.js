const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const setAsPrimaryFundingSourceSchema = Joi.object({
    id: Joi.objectId()
})

module.exports = setAsPrimaryFundingSourceSchema