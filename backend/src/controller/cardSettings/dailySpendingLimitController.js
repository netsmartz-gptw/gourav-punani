const { CHILD_NOT_FOUND, card_settings } = require("../../config/messages")
const { ErrorHandler, verifyParentChild, jsonResponse, updateUserConfig } = require("../../helpers")

const dailySpendingLimitController = async (req, res, next) => {

    try {


        const { uid, childUid, limit } = req.body

        // child verification first
        const isParentChild = await verifyParentChild(childUid, uid)
        if (!isParentChild) return jsonResponse(res, 400, CHILD_NOT_FOUND)

        // set daily spending limit on galileo

        // update user config with daliy spending limit
        const body = {
            fields: {
                cardSettings: {
                    dailySpendingLimit: limit
                }
            }
        }
        await updateUserConfig(req, body)

        // return success respnose
        return jsonResponse(res, 200, card_settings.daily_spending_limit_success)
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}
module.exports = dailySpendingLimitController