const { funding_source } = require("../../config/messages")
const { jsonResponse, ErrorHandler } = require("../../helpers")
const { userAccount } = require("../../modals")

const setFundingSourceAsPrimaryController = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { id: fundingSourceId } = req.params

        // fetch the funding source and check if already primary or not
        const fundingSource = await userAccount.findOne({
            uid,
            _id: fundingSourceId,
            accountType: 'fundingSource'
        })
        if (!fundingSource) return jsonResponse(res, 400, funding_source.not_found)
        if (fundingSource?.accountStatus === 'primary') return jsonResponse(res, 400, funding_source.already_primary)

        // set all funding sources as secondary first
        await userAccount.updateMany(
            {
                uid,
                accountType: 'fundingSource',
            },
            {
                accountStatus: 'secondary',
            }
        )

        // set the selected funding source as primary
        await userAccount.updateOne(
            {
                uid,
                _id: fundingSourceId,
                accountType: 'fundingSource'
            },
            {
                accountStatus: 'primary'
            }
        )

        // return success respones
        return jsonResponse(res, 200, funding_source.mark_primary_success)
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }

}
module.exports = setFundingSourceAsPrimaryController