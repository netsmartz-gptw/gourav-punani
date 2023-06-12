const { ErrorHandler } = require("../../helpers");
const { enableRoundUp } = require("../../validation-schemas");

const enableRoundUpValidation = (req, res, next) => {
    const result = enableRoundUp.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = enableRoundUpValidation;