const Joi = require('joi');

const ownerAdminLoadWalletSchema = Joi.object({
    amount: Joi.number().required(),
    uid: Joi.string().required()
});

module.exports = ownerAdminLoadWalletSchema;