const Joi = require('joi');

const moveMoneySchema = Joi.object({
	from: Joi.object({
		type: Joi.string().valid('primary', 'saving', 'spending', 'goal', 'funding_source').required(),
		accountNo: Joi.string().min(1).max(12).required(),
	}).required(),
	to: Joi.object({
		type: Joi.string().valid('primary', 'saving', 'spending', 'goal', 'funding_source').required(),
		accountNo: Joi.string().min(1).max(12).required(),
	}).required(),
	amount: Joi.number().when('from.type', { is: 'goal', then: Joi.number().min(1).max(500).optional(), otherwise: Joi.number().min(1).max(500).required() }),
	IP: Joi.string().optional(),
	geoLocation: Joi.string().optional(),
	address: Joi.string().optional(),
	deviceType: Joi.string().optional(),
	deviceId: Joi.string().optional(),
	deviceName: Joi.string().optional(),
	description: Joi.string().optional(),
	tags: Joi.string().optional(),
});

module.exports = moveMoneySchema;