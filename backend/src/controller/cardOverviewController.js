const { getAccountBalance, getChildUidByParentId, ErrorHandler, jsonResponse } = require("../helpers")
const { NO_CHILD_FOUND } = require("../config/messages")
const { userConfig, userAccount } = require("../modals")
const { defaultMoodleLesson } = require("../config/config")
/**
 * Fetch wallet balance of children form Galileo
 * 
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Function} next
 * @returns {JSON}
 */
const childCardOverview = async (req, res, next) => {
    try {

        const { uid } = req.body
        const promise = []

        // fetch childs details from parent uid
        const childs = await getChildUidByParentId(uid)
        if(!childs || !childs?.children || !childs.children.length) return jsonResponse(res, 400, NO_CHILD_FOUND)

        const uids = childs.children.map(child => child.uid);
        const childData = childs.children

        // fetch wallets for each child by uids
        const walletBalanceInfo = await userAccount.find({
            uid: { $in: uids },

        }).select(["uid", "pmt_ref_no", "accountType"]).lean()

        // fetch physical card status for each child 
        const userConfigs = await userConfig.find({
            uid: { $in: uids }
        }).select(["uid", "physicalCardStatus","recentlyWatchedVideo"]).lean()

        // attach wallet to each user object
        childData.forEach((child, index) => {
            const account = walletBalanceInfo.filter(wallet => wallet.uid === child.uid)
            childData[index].dataValues.account = account || []
            const cardStatus = userConfigs?.find(userConfig => userConfig.uid === child.uid)
            childData[index].dataValues.physicalCardStatus = cardStatus?.physicalCardStatus || null
            childData[index].dataValues.lesson = cardStatus?.recentlyWatchedVideo?.idNumber || defaultMoodleLesson
        })

        // create promise for fetching each child wallet balance
        walletBalanceInfo.forEach(wallet => promise.push(getAccountBalance(wallet.pmt_ref_no)))
        const balanceData = await Promise.allSettled(promise)

        // attach wallet balance to each user object
        childData.forEach((child, index) => {
            child?.dataValues?.account?.forEach((account, accountIndex) => {
                const balance = balanceData.find(balance => balance?.status === "fulfilled" && balance?.value?.accountNo === account?.pmt_ref_no)
                childData[index].dataValues.account[accountIndex].balance = balance?.value || null
            })
        })

        return jsonResponse(res, 200, childData)
    } catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = childCardOverview
