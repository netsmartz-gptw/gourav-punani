const { accounts, SERVER_ERROR } = require("../config/messages")
const { enableRoundUpAmount, ErrorHandler, jsonResponse } = require("../helpers")

const roundUpAmount = async (req, res, next) => {
    const {uid, enabled} = req.body
    try{
        const data = await enableRoundUpAmount(uid, enabled)
        if(!data) throw new Error(SERVER_ERROR)

        return jsonResponse(res, 200, accounts.round_up_success, data.data)
    }
    catch(err){
        return next(new ErrorHandler(500, null, null, err))
    }
}
module.exports = roundUpAmount