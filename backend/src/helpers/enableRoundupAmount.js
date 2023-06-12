const { v4: uuidv4 } = require('uuid');
const { SERVER_ERROR } = require('../config/messages');
const { userAccount } = require('../modals');
const axiosInstance = require('./axiosInstance');

// round up spending accoun transfer to saving ac
// for e.g. if a transaction of $1.51 is done on spending account then $0.49 should be transfered to savings account

/**
 * 
 * @param {String} uid 
 * @param {Boolean} enabled 
 * @returns Object
 */
const enableRoundUpAmount = async (uid, enabled = true) => {

    try {

        const expire = enabled ? 'N' : 'Y'

        const accounts = await userAccount.find({
            uid
        })

        const savingAc = accounts.find(account => account.accountType === 'saving')
        const spendingAc = accounts.find(account => account.accountType === 'spending')
        if (!savingAc || !spendingAc) throw new Error(SERVER_ERROR)

        const linkedAccounts = {}
        linkedAccounts[savingAc.pmt_ref_no] = 100.0

        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env
        const transactionId = uuidv4()
        const encodedParams = new URLSearchParams()
        encodedParams.set('apiLogin', GALILEO_API_LOGIN)
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
        encodedParams.set('providerId', GALILEO_PROVIDER_ID)
        encodedParams.set('transactionId', transactionId)
        encodedParams.set('accountNo', spendingAc.pmt_ref_no)
        encodedParams.set('linkedAccounts', JSON.stringify(linkedAccounts))
        encodedParams.set('expire', expire)

        return await axiosInstance.post('setRoundupAccounts', encodedParams);
    }
    catch (err) {
        throw new Error(SERVER_ERROR)
    }
}

module.exports = enableRoundUpAmount