const { v4: uuidv4 } = require('uuid')
const { SAME_AC_TRANSFER, FROM_ACCOUNT_NOT_LINKED, TO_ACCOUNT_NOT_LINKED, FUNDING_SOURCE_NOT_AVAILABLE, accounts, goals, SERVER_ERROR } = require("../config/messages")
const { axiosInstance, ErrorHandler, galileoAccountTransfer, jsonResponse, isTransferAllowedFromSavingAc, getUserConfig } = require("../helpers")
const { userAccount } = require("../modals")
const { sequelize } = require('../mysql/models')
const db = require('../mysql/models')

/**
 * API to transfer money between Galileo accounts
 * NOTE: Commented code is for the custom transaction messages
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */

const walletToWalletTransfer = async (req, res, next) => {

    const { from, to, amount, user, uid } = req.body
    const fromUids = []
    const toUids = [req.body.uid]

    // check if "From" account is associated with validated user
    // if user role is admin then add child uids in fromUids for check in database for linked accounts
    if (user.role.role === "admin" || user.role.role === "parent") {

        // if role is admin, then add the admin uid in fromUids
        // if role is parent then do not add admin or parent uid in fromUids
        if(user.role.role === "admin") fromUids.push(req.body.uid)

        // get all parent childs and use their uid to check if account is linked with any of child or parent account
        const parent = await db.Users.findOne({
            where: { id: user.id },
            attributes: ['id'],
            include: {
                model: db.Users,
                as: 'children',
                attributes: ['uid']
            }
        })
        const childs = parent.children.map(child => child)

        // push childUids in fromUids list for further finding
        childs.map(child => {
            fromUids.push(child.uid)
            toUids.push(child.uid)
        })
    }
    else {

        // add child uid first in fromUids
        fromUids.push(uid)

        // get all user who are linked with current user parent profile and push them to toUids
        const parentId = await db.ParentChild.findOne({
            where: { child_id: user.id },
            attributes: ['id']
        })
        const parent = await db.Users.findAll({
            where: { id: parentId.id },
            attributes: ['id', 'uid'],
            include: {
                model: db.Users,
                as: 'children',
                attributes: ['uid'],
                required: true
            }
        })
        if (parent && parent.uid) toUids.push(parent.uid)
        parent.children.map(child => toUids.push(child.uid))

    }

    // check if fromAccount is linked with any of child or parent account
    // if no linked parent or child account found with fromAccount then return error
    const fromCount = await userAccount.count({
        uid: {
            $in: fromUids
        },
        pmt_ref_no: from.accountNo
    })
    if (!fromCount) return jsonResponse(res, 400, FROM_ACCOUNT_NOT_LINKED)

    // check if "To" account is associated with validated user
    // if no linked parent or child account found with toAccount then return error
    const toCount = await userAccount.count({
        uid: {
            $in: toUids
        },
        pmt_ref_no: to.accountNo
    })
    if (!toCount) return jsonResponse(res, 400, TO_ACCOUNT_NOT_LINKED)

    // if transfer is from saving account, first make sure if amount is freezed due to goals
    if (from.type === "saving") {
        try {
            await isTransferAllowedFromSavingAc(uid, from.accountNo, amount)
        }
        catch (err) {
            return jsonResponse(res, 400, err.message)
        }
    }

    const galileoResponse = await galileoAccountTransfer(from.accountNo, to.accountNo, amount)

    if (galileoResponse?.data?.status === 'Success') return jsonResponse(res, 200, '', galileoResponse?.data)
    else return jsonResponse(res, 400, '', galileoResponse?.data)
}

const savingToGoalTransfer = async (req, res, next) => {

    try {

        const { from, to, amount, uid, user } = req.body

        const savingAc = await userAccount.findOne({
            uid,
            accountType: 'saving',
            pmt_ref_no: from.accountNo
        })
        if (!savingAc) return jsonResponse(res, 400, accounts.saving_ac_not_found)

        const goalAc = await db.goals.findOne({
            where: {
                uid,
                id: to.accountNo,
            }
        })
        if (!goalAc) return jsonResponse(res, 400, accounts.goal_ac_not_found)

        if (goalAc.dataValues.status === 1) return jsonResponse(res, 400, goals.inactive_goal_transfer_error)
        if (goalAc.dataValues.closureStatus === 1) return jsonResponse(res, 400, goals.closed_goal_transfer_error)

        try {
            await isTransferAllowedFromSavingAc(uid, from.accountNo, amount)
        }
        catch (err) {
            return jsonResponse(res, 400, err.message)
        }

        await db.goals.update(
            {
                progressAmount: sequelize.literal(`progressAmount + ${amount}`)
            },
            { where: { id: to.accountNo } }
        )

        return jsonResponse(res, 200, 'Funds allocated goal successfully')
    }
    catch (err) {
        throw err
    }
}

const goalToSpendingTransfer = async (req, res, next) => {

    try {
        const { from, to, amount, uid, user } = req.body

        // check if goals account belongs to user 
        const goalAc = await db.goals.findOne({
            where: {
                uid,
                id: from.accountNo,
            }
        })
        if (!goalAc) return jsonResponse(res, 400, accounts.goal_ac_not_found)

        // check if goal is completed or not first
        if (goalAc.dataValues.progressAmount < goalAc.dataValues.goalAmount)
            return jsonResponse(res, 400, goals.not_completed_transfer_error)

        // if goal is already closed , then return error
        if (goalAc.dataValues.closureStatus == 1) return jsonResponse(res, 400, goals.ALREADY_CLOSED)

        // check if spending account belongs to user
        const spendingAc = await userAccount.findOne({
            uid,
            accountType: 'spending',
            pmt_ref_no: to.accountNo
        })
        if (!spendingAc) return jsonResponse(res, 400, accounts.spending_ac_not_found)

        // fetch user saving account details
        const savingAc = await userAccount.findOne({
            uid,
            accountType: 'saving'
        })
        if (!savingAc) throw new Error(SERVER_ERROR)

        // transfer from saving account to goal for goal payment, all goal amount will be transferred
        const galileoResponse = await galileoAccountTransfer(savingAc.pmt_ref_no, spendingAc.pmt_ref_no, goalAc.dataValues.progressAmount)
        console.log(galileoResponse)
        if (galileoResponse?.data?.status != 'Success') throw new Error(SERVER_ERROR)

        // - udpate goal status to 1 (not active, if not already done)
        // - update goal closureStatus to 1 (goal closed)
        await db.goals.update(
            {
                status: 1,
                closureStatus: 1
            },
            {
                where: { id: goalAc.dataValues.id }
            }
        )

        // return success response
        return jsonResponse(res, 200, goals.spending_transfer_success)

    }
    catch (err) {
        throw err
    }

}


const moveMoney = async (req, res, next) => {

    try {

        const { from, to, amount, user, uid } = req.body
        // console.log(user);return;

        // initial comon checks

        // --- check if from and toAccount are same
        if (from.accountNo === to.accountNo) jsonResponse(res, 400, SAME_AC_TRANSFER)

        // if transfer from saving, then check first if transfer is allowed or not
        if (from.type === "saving") {
            const config = await getUserConfig(req, uid)
            console.log(config)
            if (config.length) {
                const isTranserAllowed = config[0]?.cardSettings?.savingTransfer
                if (isTranserAllowed === false) return jsonResponse(res, 400, accounts.saving_transfer_not_allowed)
            }
        }

        if (from.type === "primary" && to.type === "saving") await walletToWalletTransfer(req, res, next)
        else if (from.type === "primary" && to.type === "spending") await walletToWalletTransfer(req, res, next)
        else if (from.type === "saving" && to.type === "primary") await walletToWalletTransfer(req, res, next)
        else if (from.type === "saving" && to.type === "spending") await walletToWalletTransfer(req, res, next)
        else if (from.type === "saving" && to.type === "saving") await walletToWalletTransfer(req, res, next)
        else if (from.type === "saving" && to.type === "goal") await savingToGoalTransfer(req, res, next)
        else if (from.type === "spending" && to.type === "primary") await walletToWalletTransfer(req, res, next)
        else if (from.type === "spending" && to.type === "saving") await walletToWalletTransfer(req, res, next)
        else if (from.type === "spending" && to.type === "spending") await walletToWalletTransfer(req, res, next)
        else if (from.type === "goal" && to.type === "spending") await goalToSpendingTransfer(req, res, next)
        else return jsonResponse(res, 400, accounts.not_type_found_error)

    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err));
    }
}

module.exports = moveMoney