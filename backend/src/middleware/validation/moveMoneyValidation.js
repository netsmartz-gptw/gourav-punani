const { ErrorHandler } = require("../../helpers");
const moveMoneySchema = require("../../validation-schemas/moveMoneySchema");

const moveMoneyValidation = (req, res, next) => {
    const result = moveMoneySchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = moveMoneyValidation;