const { ErrorHandler } = require('../../helpers')
const getAccountBalance = require('../../helpers/v1/getAccountBalance')

const getAccountBalanceController = async (req, res, next) => {

    try {

        const { accounts } = req.body

        const promises = []
        accounts.forEach(account => promises.push(getAccountBalance(account)))

        const response = await Promise.all(promises)
        console.log(response)

        const finalBalances = response.map(data => {
            return { balance: data.balance.data.response_data.balance, accountNo: data.accountNo }
        })

        return res.status(200).send(finalBalances)
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}
module.exports = getAccountBalanceController