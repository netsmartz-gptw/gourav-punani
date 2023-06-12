const { ErrorHandler } = require("../../helpers");
const { updateInternationalAccessSchema } = require("../../validation-schemas");

const internationalAccessValidation = (req, res, next) => {
    const result = updateInternationalAccessSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = internationalAccessValidation;