const Joi = require('joi').extend(require('@joi/date'))

const createAccountSchema = Joi.object({
	firstName: Joi.string().regex(/^[a-zA-Z ]+$/).required().messages({
		"string.pattern.base": "firstname should contain only a-z, A-Z characters"
	}),
	lastName: Joi.string().regex(/^[a-zA-Z ]+$/).required().messages({
		"string.pattern.base": "lastname should contain only a-z, A-Z characters"
	}),
	dob: Joi.date().format('YYYY-MM-DD').max('now').required(),
	street_address: Joi.string().required(),
	city: Joi.string().max(30).required(),
	state: Joi.string().length(2).required(),
	zip: Joi.string().length(5).required(),
	phone_no: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
	ssn: Joi.string().length(9).pattern(/^[0-9]+$/).required(),
});

module.exports = createAccountSchema;