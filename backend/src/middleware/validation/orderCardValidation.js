const { ErrorHandler } = require("../../helpers");
const { orderCardSchema } = require("../../validation-schemas");

const orderCardValidation = (req, res, next) => {
    const result = orderCardSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = orderCardValidation;