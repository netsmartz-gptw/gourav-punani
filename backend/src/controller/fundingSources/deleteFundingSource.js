const { funding_source } = require("../../config/messages")
const { jsonResponse, ErrorHandler, removeAchAccount, removeItem } = require("../../helpers")
const { userAccount } = require("../../modals")

const deleteFundingSource = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { id: fundingSourceId } = req.params

        // if primary funding source, do not allow to delete
        const fundingSource = await userAccount.findOne({
            uid,
            _id: fundingSourceId,
        })
        if (!fundingSource) return jsonResponse(res, 400, funding_source.not_found)

        if (fundingSource.accountStatus === 'primary') return jsonResponse(res, 400, funding_source.primay_delete_error)

        // check the count of parnet funding sources, if only one, then don't allow it
        const count = await userAccount.count({
            uid,
            accountType: 'fundingSource'
        })
        if (count <= 1) return jsonResponse(res, 400, funding_source.atleast_one_error)

        // fetch parent primary galileo account
        const primaryAccount = await userAccount.findOne({
            accountType: 'primary',
            uid
        })
        if (!primaryAccount) return jsonResponse(res, 400, funding_source.not_found)

        // delete account details form galileo
        const response = await removeAchAccount(primaryAccount.pmt_ref_no, fundingSource.ach_account_id)
        if (response?.data?.status_code !== 0 && response?.data?.status_code !== '492-02') throw new Error(response?.data?.status)

        // delete account details from plaid
        if (fundingSource?.plaidAccessToken) {
            await removeItem(fundingSource.plaidAccessToken)
        }

        // delete funding source from system
        await userAccount.deleteOne({ _id: fundingSourceId })

        // return success response
        return jsonResponse(res, 200, funding_source.removed_success)

    }
    catch (err) {
        return next(new ErrorHandler(500, err, null, err))
    }
}
module.exports = deleteFundingSource