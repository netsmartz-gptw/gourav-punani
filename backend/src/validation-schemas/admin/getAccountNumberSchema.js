const Joi = require('joi');

const getAccountNumberSchema = Joi.object({
    uids: Joi.array().items().min(1).max(100).required()
});

module.exports = getAccountNumberSchema;