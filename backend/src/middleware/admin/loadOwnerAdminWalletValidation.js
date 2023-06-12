const { ErrorHandler } = require("../../helpers");
const { ownerAdminLoadWalletSchema } = require("../../validation-schemas");

const loadOwnerAdminWalletValidation = (req, res, next) => {
    const result = ownerAdminLoadWalletSchema.validate(req.body)
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = loadOwnerAdminWalletValidation