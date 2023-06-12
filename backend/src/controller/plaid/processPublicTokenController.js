const client = require('./config')
const { FUNDING_SOURCE_LINKED, NO_WALLET_FOUND, PLAID_NO_ACCOUNT_LINKED, plaid } = require('../../config/messages')
const { addAchAccount, ErrorHandler, jsonResponse } = require('../../helpers')
const { userAccount } = require('../../modals')


/**
 * This controller accept a public token and generate an access token
 * access token is further passed to generate processor_token
 * processor_token is futher used to link galileo with funding source
 * galileo returns an account_id for the funding source
 * 
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Function} next
 * @returns {JSON}
 */
const exchangePublicToken = async (req, res, next) => {

    try {

        const { uid } = req.body

        const userSpendingAccount = await userAccount.findOne({ uid })
        if (!userSpendingAccount) return jsonResponse(res, 400, NO_WALLET_FOUND)

        // setup request payload
        const publicTokenRequest = {
            public_token: req.body.public_token,
        }

        // STEP 1
        // exchange public token with plaid for access token
        const publicTokenResponse = await client.itemPublicTokenExchange(publicTokenRequest)
        if (!publicTokenResponse?.data?.access_token) return next(new ErrorHandler(500, null, null, plaid.exchange_public_token_error))

        const access_token = publicTokenResponse.data.access_token

        // STEP 2
        // Create processor token for each account 
        const accounts = req.body.accounts
        if (!accounts.length) return next(new ErrorHandler(500, null, null, PLAID_NO_ACCOUNT_LINKED))

        const processorTokenPromises = []

        accounts.forEach(account => {

            const processorTokenRequest = {
                access_token: access_token,
                account_id: account.id,
                processor: 'galileo',
            }

            processorTokenPromises.push(client.processorTokenCreate(processorTokenRequest))
        })

        const processorTokenData = await Promise.all(processorTokenPromises)

        // STEP 3
        // pass processor_token in galileo for generating account_id
        const accountIdPromises = []

        processorTokenData.forEach(data => {
            accountIdPromises.push(addAchAccount(userSpendingAccount.pmt_ref_no, data.data.processor_token))
        })

        const galileoAccountsData = await Promise.all(accountIdPromises)

        // STEP 4
        // check funding source count in system and if no funding source in system, then mark one of this funding source as primary
        const fundingSourceCount = await userAccount.count({
            uid,
            accountType: 'fundingSource'
        })

        // STEP 5
        // store account_id with other data in userAccoutns table as funding source
        // fetch account details from galileo using account_id of the user to store data in our system

        for (index = 0; index < galileoAccountsData.length; index++) {

            const query = {
                ach_account_id: galileoAccountsData[index].response_data.ach_account_id,
                uid: req.body.uid
            }

            const data = {
                institution: req.body.institution,
                plaidAccountId: accounts[index].id,
                name: accounts[index].name,
                mask: accounts[index].mask,
                type: accounts[index].type,
                subtype: accounts[index].subtype,
                verification_status: accounts[index].verification_status,
                class_type: accounts[index].class_type,
                ach_account_id: galileoAccountsData[index].response_data.ach_account_id,
                transactionId: galileoAccountsData[index].echo.transaction_id,
                rtoken: galileoAccountsData[index].rtoken,
                processorToken: galileoAccountsData[index].processorToken,
                accountType: "fundingSource",
                uid: req.body.uid,
                plaidAccessToken: access_token,
                accountStatus: !fundingSourceCount && index == 0 ? 'primary' : 'secondary'
            }

            await userAccount.findOneAndUpdate(query, data, {
                new: true,
                upsert: true
            })
        }

        // STEP 6
        // return sucess response
        return res.status(200).send({
            statusCode: 200,
            response: {
                message: FUNDING_SOURCE_LINKED,
                access_token,
                galileoAccountsData
            }
        })

    } catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}
module.exports = exchangePublicToken