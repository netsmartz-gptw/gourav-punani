const { ErrorHandler } = require("../../helpers");
const { createAccountSchema } = require("../../validation-schemas");

const createChoreValidation = (req, res, next) => {
    const result = createAccountSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = createChoreValidation;