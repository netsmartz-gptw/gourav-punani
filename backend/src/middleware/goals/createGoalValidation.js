const { ErrorHandler } = require("../../helpers/errorHandler")
const { createGoalsSchema } = require("../../validation-schemas")

const createGoalValidation = (req, res, next) => {
    const result = createGoalsSchema.validate(req.body)
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = createGoalValidation