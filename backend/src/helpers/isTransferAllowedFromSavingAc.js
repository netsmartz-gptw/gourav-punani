const { SERVER_ERROR, wallet } = require("../config/messages")
const getAccountBalance = require("./getAccountBalance")
const getGoalsProgressTotal = require("./goals/getGoalsProgressTotal")

const isTransferAllowedFromSavingAc = async (uid, accountNo, transferAmount) => {

    try {

        // fetch savings account balance
        const balanceData = await getAccountBalance(accountNo)
        console.log(balanceData)
        if(balanceData?.status_code != 0) throw new Error(SERVER_ERROR)
        const galileoBalance = balanceData?.response_data?.balance || 0

        if (galileoBalance < transferAmount) throw new Error(wallet.not_sufficient_funds)

        // first fetch active goals as freezed balance in savings account
        const goalsBalance = await getGoalsProgressTotal(uid)

        // final balance after deducting goals balance
        const availableBalance = galileoBalance - goalsBalance.dataValues.goalsTotal

        console.log('galileoBalance: ' + galileoBalance)
        console.log('goals balance: ' + goalsBalance.dataValues.goalsTotal)
        console.log('availableBalance: ' + availableBalance)
        console.log('transferAmount: ' + transferAmount)

        // check if enough balance to transfer after deduction of freezed balance
        if (availableBalance < transferAmount) throw new Error(wallet.not_sufficient_funds)

        return true

    }
    catch (err) {
        console.log(err)
        throw new Error(err.message)
    }
}

module.exports = isTransferAllowedFromSavingAc