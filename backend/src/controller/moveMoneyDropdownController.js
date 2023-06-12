const { userAccount } = require("../modals")
const db = require('../mysql/models')
const { ErrorHandler, getAccountBalance, jsonResponse } = require("../helpers")
const { WALLET_BAL_NOT_FOUND, USER_NOT_FOUND } = require("../config/messages")


/**
 * Fetch wallet balance for parent and children
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const userAccounts = async (req, res, next) => {

    try {
        const { uid } = req.body
        const { user, role } = req
        const accounts = []
        let walletBalanceInfo;

        // check for parent or admin role
        // Parent Role Fields :
        //      from field will have all childs account but not the owner account
        //      to field will have all the accounts (child + parent)
        if (role === 'admin' || role === 'parent') {

            // fetch childs from parent uid 
            const user = await db.Users.findOne({
                where: { uid },
                attributes: ['id', 'firstName', 'lastName', 'uid'],
                include: [{
                    model: db.Users,
                    as: 'children',
                    attributes: ['uid', 'firstName', 'lastName']
                }],
            });
            if (!user) return jsonResponse(res, 400, USER_NOT_FOUND)
            // fetching child uid's
            const uids = user.children.map(child => child.uid);

            // adding owner/admin uid to child uid's for fetching wallet info from userAccounts
            uids.push(uid)

            const childData = user.children

            // fetch wallet balance details from user account  
            walletBalanceInfo = await userAccount.find({
                uid: { $in: uids },
            }).select(["uid", "pmt_ref_no", "accountType"]).exec()
            console.log('walletBalanceInfo', walletBalanceInfo)

            // if wallet balance details not found return error
            if (!walletBalanceInfo) return jsonResponse(res, 400, WALLET_BAL_NOT_FOUND)

            // to add parent details and wallet info with child's data
            const parentWallet = walletBalanceInfo.filter(wallet => wallet.uid === user.uid)
            if (parentWallet.length) {

                accounts.push(
                    {
                        uid,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        accountNo: parentWallet[0].pmt_ref_no,
                        accountType: parentWallet[0].accountType
                    }
                )

            }

            // adding waleet info to child's data
            childData.forEach((child) => {
                walletBalanceInfo.forEach((wallet) => {
                    if (wallet.uid === child.uid) {

                        accounts.push(
                            {
                                ...child.dataValues,
                                accountNo: wallet.pmt_ref_no,
                                accountType: wallet.accountType
                            }
                        )

                    }
                })
            })

        }
        else if (role === 'child') {

            // fetch parent details from child uid 
            const user = await db.Users.findOne({
                where: { uid },
                attributes: ['uid', 'firstName', 'lastName'],
                include: [{
                    model: db.Users,
                    as: 'parent',
                    attributes: ['uid', 'firstName', 'lastName']
                }],
            });

            if (!user) return jsonResponse(res, 400, USER_NOT_FOUND)
            const parentData = user.parent

            // fetch wallet balance details from user account  
            walletBalanceInfo = await userAccount.find({
                uid: { $in: [uid, parentData.uid] },
            }).select(["uid", "pmt_ref_no", "accountType"]).exec()

            // if wallet balance details not found return error
            if (!walletBalanceInfo) return jsonResponse(res, 400, WALLET_BAL_NOT_FOUND)

            const parentWallet = walletBalanceInfo.filter(wallet => wallet.uid === parentData.uid)

            accounts.push(
                {
                    uid: user.parent.uid,
                    firstName: user.parent.firstName,
                    lastName: user.parent.lastName,
                    accountNo: parentWallet[0].pmt_ref_no,
                    accountType: parentWallet[0].accountType

                }
            )

            walletBalanceInfo.forEach((wallet) => {
                if (wallet.uid === user.uid) {

                    accounts.push(
                        {
                            uid: user.dataValues.uid,
                            firstName: user.dataValues.firstName,
                            lastName: user.dataValues.lastName,
                            accountNo: wallet.pmt_ref_no,
                            accountType: wallet.accountType
                        }
                    )
                }
            })
        }

        // fetch balnace information for user accounts
        const promise = []
        walletBalanceInfo.forEach(wallet => promise.push(getAccountBalance(wallet.pmt_ref_no)))
        const balanceData = await Promise.allSettled(promise)

        // add balance to existing user details
        accounts.forEach((acc) => {
            const balance = balanceData.find(balance => balance?.status === "fulfilled" && balance?.value?.accountNo === acc?.accountNo)
            acc.balance = balance?.value?.response_data?.balance || null
        })

        // fetch goals if role is child
        if (role === 'child') {
            const goals = await db.goals.findAll({
                where: {
                    uid,
                    closureStatus: 0
                },
                raw: true,
                nest: true,
            })
            if (goals.length > 0) {

                goals.forEach(goal => {
                    accounts.push(
                        {
                            uid: goal.uid,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            title: goal.title,
                            accountNo: goal.id,
                            accountType: 'goal',
                            balance: goal.progressAmount
                        }
                    )
                })

            }
        }

        return res.status(200).send({
            statusCode: 200,
            response: {
                accountDetails: accounts
            }
        })
    } catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = userAccounts
