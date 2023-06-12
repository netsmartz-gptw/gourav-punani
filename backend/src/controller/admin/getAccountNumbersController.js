const { getParentAccountNumber, ErrorHandler } = require("../../helpers")

const getAccountNumbersController = async (req, res, next) => {

    try {

        const { uids } = req.body

        const promises = []
        uids.forEach(uid => {
            promises.push(getParentAccountNumber(uid))
        })

        const accounts = await Promise.all(promises)

        const filteredAccounts = accounts.map(account => {
            return { uid: account?.uid, accountNo: account?.account?.pmt_ref_no || null}
        })

        return res.send(filteredAccounts)
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = getAccountNumbersController