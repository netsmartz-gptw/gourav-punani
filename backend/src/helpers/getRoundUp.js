const { v4: uuidv4 } = require('uuid');
const { SERVER_ERROR } = require('../config/messages');
const { userAccount } = require('../modals');
const axiosInstance = require('./axiosInstance');

const getRoundUp = async (uid) => {

    try{
        const accounts = await userAccount.find({
            uid
        })
    
        const savingAc = accounts.find(account => account.accountType === 'saving')
        const spendingAc = accounts.find(account => account.accountType === 'spending')
        if(!savingAc || !spendingAc) throw new Error(SERVER_ERROR)

        const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env
        const transactionId = uuidv4()
        const encodedParams = new URLSearchParams()
        encodedParams.set('apiLogin', GALILEO_API_LOGIN)
        encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY)
        encodedParams.set('providerId', GALILEO_PROVIDER_ID)
        encodedParams.set('transactionId', transactionId)
        encodedParams.set('accountNo', spendingAc.pmt_ref_no)
        
        return await axiosInstance.post('getRoundupAccounts', encodedParams);
    }
    catch (err) {
        throw new Error(SERVER_ERROR)
    } 
}

module.exports = getRoundUp