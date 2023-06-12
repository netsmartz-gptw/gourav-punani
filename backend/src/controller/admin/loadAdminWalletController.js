const { PARENT_WALLET_NOT_FOUND, PARENT_FUNDING_SOURCE_NOT_FOUND, WALLET_FUNDED_SUCCESSFULLY } = require("../../config/messages")
const { jsonResponse, createAchTransaction, ErrorHandler } = require("../../helpers")
const { userAccount } = require("../../modals")

const loadAdminWalletController = async (req, res, next) => {

    try {

        const { uid, amount } = req.body

        // fetch parent wallet deatils
        const wallet = await userAccount.findOne({
            uid,
            accountType: 'primary'
        })
        if (!wallet) return jsonResponse(res, 400, PARENT_WALLET_NOT_FOUND)

        // fetch parent primary funding source deatils
        const fundingSource = await userAccount.findOne({
            uid,
            accountType: 'fundingSource'
        })
        if (!fundingSource) return jsonResponse(res, 400, PARENT_FUNDING_SOURCE_NOT_FOUND)

        // create ach transaction to fund parent wallet from primary funding soucre
        await createAchTransaction(wallet.pmt_ref_no, fundingSource.ach_account_id, amount, 'D')

        return jsonResponse(res, 200, WALLET_FUNDED_SUCCESSFULLY)
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}
module.exports = loadAdminWalletController