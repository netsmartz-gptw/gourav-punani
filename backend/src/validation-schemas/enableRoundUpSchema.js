const Joi = require('joi');

const enableRoundUp = Joi.object({
	enabled: Joi.boolean().required(),
});

module.exports = enableRoundUp;