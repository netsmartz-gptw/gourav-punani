const Joi = require('joi');

const autoReloadWalletSchema = Joi.object({
    autoReloadType: Joi.string().required().valid('NOW_AND_EVERY_MONTH', 'EVERY_MONTH', 'INITIAL_AMOUNT', 'NO_AUTO_RELOAD', 'LOW_BALANCE'),
    autoReloadAmount: Joi.number().required()
})

module.exports = autoReloadWalletSchema