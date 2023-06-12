const { USER_NOT_FOUND, NO_WALLET_FOUND } = require("../config/messages")
const { getAccountBalance, ErrorHandler, jsonResponse } = require("../helpers")
const { userAccount } = require("../modals")
const db = require('../mysql/models')

/**
 * Fetch wallet balance of parent's primary or child's saving and spending accounts
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const walletBalance = async (req, res, next) => {

    try {
        const { uid } = req.body

        // fetch user role first to fetch balance accordingly
        const user = await db.Users.findOne({
            where: {
                uid
            },
            include: {
                model: db.role,
                attributes: ['role'],
                required: true
            },
            raw: true,
            nest: true,
        })
        if (!user) return jsonResponse(res, 400, USER_NOT_FOUND)

        // if user role is admin, fetch admin wallet balance
        // if user role is child, fetch both spending and saving wallet and fetch balances
        if (user.role.role === 'admin') {

            const wallet = await userAccount.findOne({
                uid
            })
            if (!wallet) return jsonResponse(res, 400, NO_WALLET_FOUND)

            const accountNo = wallet.pmt_ref_no
            const balance = await getAccountBalance(accountNo)

            return res.status(200).send({
                statusCode: 200,
                response: {
                    balance
                }
            })
        }
        else {

            let saving_balance = {}
            let spending_balance = {}

            const wallet = await userAccount.find({
                uid
            })
            if (!wallet) return jsonResponse(res, 400, NO_WALLET_FOUND)

            const spending_wallet = wallet.find(wallet => wallet.accountType === 'spending')
            const saving_wallet = wallet.find(wallet => wallet.accountType === 'saving')

            if (saving_wallet) saving_balance = await getAccountBalance(saving_wallet.pmt_ref_no)
            if (spending_wallet) spending_balance = await getAccountBalance(spending_wallet.pmt_ref_no)

            return res.status(200).send({
                statusCode: 200,
                response: {
                    balance: {
                        saving_balance,
                        spending_balance
                    }
                }
            })
        }

    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }

}

module.exports = walletBalance