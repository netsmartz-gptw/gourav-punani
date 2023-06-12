const Joi = require('joi');

const updateInternationalAccessSchema = Joi.object({
  childUid: Joi.string().required(),
});

module.exports = updateInternationalAccessSchema;