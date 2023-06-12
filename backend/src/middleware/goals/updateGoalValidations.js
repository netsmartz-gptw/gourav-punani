const { ErrorHandler } = require("../../helpers/errorHandler")
const { updateGoalsSchema } = require("../../validation-schemas")

const updateGoalValidation = (req, res, next) => {
    const result = updateGoalsSchema.validate(req.body)
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = updateGoalValidation