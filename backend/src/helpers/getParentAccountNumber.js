const { userAccount } = require("../modals")

const getParentAccountNumber = async (uid) => {
    return {
        uid,
        account: await userAccount.findOne({ uid }).select('pmt_ref_no')
    }
}

module.exports = getParentAccountNumber