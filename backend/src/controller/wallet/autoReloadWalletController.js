const { AUTO_RELOAD_CONFIGURATION_UPDATED, NO_PRIMARY_FUNDING_SOURCE, PARENT_WALLET_NOT_FOUND } = require("../../config/messages");
const { ErrorHandler, updateUserConfig, jsonResponse, createAchTransaction } = require("../../helpers");
const { userAccount } = require("../../modals");

const autoReloadWalletController = async (req, res, next) => {

    const { uid, autoReloadType, autoReloadAmount } = req.body

    try {

        const body = {
            autoLoadWallet: {}
        }
        const [fundingSource, galileoAccount] = await parentAccountDetails(res, uid)

        // take action based on autoReloadType
        switch (autoReloadType) {

            case 'NO_AUTO_RELOAD':

                // update user config to no auto reload
                body.autoLoadWallet.autoLoadType = 'NO_AUTO_RELOAD'
                body.autoLoadWallet.autoReloadAmount = 0
                await updateUserConfig(req, body)

                break;

            case 'NOW_AND_EVERY_MONTH':
                // load funds in wallet immediately and set every month load before subscription

                // make ach transaction first
                await createAchTransaction(galileoAccount.pmt_ref_no, fundingSource.ach_account_id, autoReloadAmount, 'D')

                // setup auto load wallet configuration
                body.autoLoadWallet.autoLoadType = 'BEFORE_SUBSCRIPTION'
                body.autoLoadWallet.autoReloadAmount = autoReloadAmount
                await updateUserConfig(req, body)
                break;

            case 'EVERY_MONTH':
                // set every month load before subscription 
                body.autoLoadWallet.autoLoadType = 'BEFORE_SUBSCRIPTION'
                body.autoLoadWallet.autoReloadAmount = autoReloadAmount
                await updateUserConfig(req, body)
                break;

            case 'INITIAL_AMOUNT':
                console.log('in intial amount')
                // update user config to no auto reload
                body.autoLoadWallet.autoLoadType = 'NO_AUTO_RELOAD'
                body.autoLoadWallet.autoReloadAmount = 0

                // load initial funds in wallet and set no auto reload in config 
                const data = await createAchTransaction(galileoAccount.pmt_ref_no, fundingSource.ach_account_id, autoReloadAmount, 'D')
                console.log(data)

                break;

            case 'LOW_BALANCE':
                // set user config to load wallet when balance is below the minimum given amount 
                body.autoLoadWallet.autoLoadType = 'LOW_BALANCE'
                body.autoLoadWallet.autoReloadAmount = autoReloadAmount
                await updateUserConfig(req, body)
                break;
        }

        // return success response
        return jsonResponse(res, 200, AUTO_RELOAD_CONFIGURATION_UPDATED)

    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}

const parentAccountDetails = async (res, uid) => {
    // fetch parent primary funding source and galileo account number
    const fundingSource = await userAccount.findOne({
        uid,
        accountStatus: 'primary'
    })
    if (!fundingSource) return jsonResponse(res, 400, NO_PRIMARY_FUNDING_SOURCE)

    const galileoAccount = await userAccount.findOne({
        uid,
        accountType: 'primary'
    })
    if (!galileoAccount) return jsonResponse(res, 400, PARENT_WALLET_NOT_FOUND)

    return [fundingSource, galileoAccount]
}

module.exports = autoReloadWalletController