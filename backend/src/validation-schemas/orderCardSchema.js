const Joi = require('joi');

const orderCardSchema = Joi.object({
	childUid: Joi.string().required(),
	streetAddress: Joi.string().required(),
	city: Joi.string().max(30).required(),
	state: Joi.string().length(2).required(),
	zip: Joi.string().length(5).required(),
});

module.exports = orderCardSchema;