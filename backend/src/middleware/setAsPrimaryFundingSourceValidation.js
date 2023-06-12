const { jsonResponse } = require("../helpers");
const { setAsPrimaryFundingSourceSchema } = require("../validation-schemas");

const setAsPrimaryFundingSourceValidation = (req, res, next) => {
    const result = setAsPrimaryFundingSourceSchema.validate(req.params);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = setAsPrimaryFundingSourceValidation;