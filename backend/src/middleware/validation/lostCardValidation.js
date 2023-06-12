const { ErrorHandler } = require("../../helpers");
const { lostCardSchema } = require("../../validation-schemas");

const lostCardValidation = (req, res, next) => {
    const result = lostCardSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = lostCardValidation;