const { userAccount } = require("../modals")
const { getAccountTransactions, ErrorHandler, jsonResponse } = require("../helpers")
const { INVALID_ACCOUNT, USER_ACC_NOT_FOUND } = require("../config/messages")

/**
 * Fetch account transaction from Galileo
 * 
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Function} next
 * @returns {JSON}
 */
const accountTransactions = async (req, res, next) => {
    try{

        const { uid } = req.body
        const { accountType } = req.params
        const { page, recordCnt } = req.query
  
        // check for account type other than saving or spending
        if(!((accountType == 'saving') || (accountType == 'spending') || (accountType == 'primary')))
            return jsonResponse(res, 400, INVALID_ACCOUNT)
    
        // fetch account details
        const userAcc = await userAccount.findOne({
            uid: uid,
            accountType:accountType
        }).select([ "uid", "pmt_ref_no" ]).lean()

        // if user account doesn't exist
        if(!userAcc) return jsonResponse(res, 400, USER_ACC_NOT_FOUND)

        // account no to fetch transaction history
        const accountNo = userAcc.pmt_ref_no

        const accountTransaction = await getAccountTransactions(accountNo, page, recordCnt)

        accountTransaction.response_data.transactions.map((value) => {
            value.amount = parseFloat(value.amt)

            if( value.amt < 0 ){
                value.transactionType = "Debit"
            }
            else{
                value.transactionType = "Credit"
            }
      
            return {
                ...accountTransaction,
            }
        })

        return res.status(200).send({
            statusCode: 200,
            response: { 
               accountTransaction
            }
        });
    }
    catch(err){
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = accountTransactions