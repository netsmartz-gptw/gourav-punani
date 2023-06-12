const { jsonResponse } = require("../../helpers")
const { userAccount } = require("../../modals")

const listFundingSources = async (req, res, next) => {

    try {

        const { uid } = req.body

        const fundingSources = await userAccount.find({
            accountType: 'fundingSource',
            uid
        })

        return jsonResponse(res, 200, '', fundingSources)
    }
    catch (err) {
        return next(new ErrorHandler(500, err, null, err))
    }
}

module.exports = listFundingSources

