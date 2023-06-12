const { ErrorHandler, jsonResponse } = require("../../helpers");
const { getAccountNumberSchema } = require("../../validation-schemas");

const getAccountNumbersValidation = (req, res, next) => {
    const result = getAccountNumberSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = getAccountNumbersValidation;