const { jsonResponse } = require("../helpers");
const autoReloadWalletSchema = require("../validation-schemas/autoReloadWalletSchema");

const autoReloadWalletValidation = (req, res, next) => {
    const result = autoReloadWalletSchema.validate(req.body);
    if (result.error) return jsonResponse(res, 400, result.error.details[0].message)
    return next()
}

module.exports = autoReloadWalletValidation;