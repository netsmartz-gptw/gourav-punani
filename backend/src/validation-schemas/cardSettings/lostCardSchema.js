const Joi = require('joi');

const lostCardSchema = Joi.object({
  childUid: Joi.string().required(),
  withReplacement: Joi.boolean().required(),
  shippingAddress: Joi.when('withReplacement', {
    is: true,
    then: Joi.object({
      streetAddress: Joi.string().required(),
      city: Joi.string().max(30).required(),
      state: Joi.string().length(2).required(),
      zip: Joi.string().length(5).required(),
    }).required(),
    otherwise: Joi.optional()
  }),

});

module.exports = lostCardSchema;