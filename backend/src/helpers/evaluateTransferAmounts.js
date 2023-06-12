const db = require('../mysql/models');
const moment = require('moment')

const getUserConfig = require('./getUserConfig');
const getUnpaidChores = require('./getUnpaidChores');
const getAccountBalance = require('./getAccountBalance');
const galileoAccountTransfer = require('./galileoAccountTransfer');
const markChoresAsPaid = require('./markChoresAsPaid');
const fetchLearningTransactions = require('./fetchLearningTransactions');
const markLearningTxnsAsPaid = require('./markLearningTxnsAsPaid');
const fetchGoals = require('./goals/fetchGoals');
const processGoalPayment = require('./goals/processGoalPayment');
const { userAccount } = require("../modals")
const {
	PARENT_NOT_FOUND,
	PARENT_WALLET_NOT_FOUND,
	ERROR_FETCH_PARENT_WALLET,
	CONFIG_NOT_FOUND,
	INCORRECT_DAY,
	USER_ACC_NOT_FOUND,
	INSUFFICENT_BALANCE,
} = require("../config/messages")
const createNotifications = require('./microservice-connection/createNotifications');
const { notifications } = require('../config/config');

/**
 * Fetch parent details, account and balance
 * 
 * @param {String} childUid 
 * @returns {Object}
 */
const fetchParentAccountDetails = async (childUid) => {
	try {
		/* Fetch parent uid */
		const parentDetails = await db.Users.findOne({
			attributes: ['id', 'uid'],
			include: {
				model: db.Users,
				as: 'children',
				attributes: ['uid'],
				where: { uid: childUid },
				required: true
			},
			logging: false
		});
		if (!parentDetails.uid) { return { error: PARENT_NOT_FOUND} }

		/* Fetch parent account info */
		const parentWallet = await userAccount.findOne({ uid: parentDetails.uid }).lean()
		if (!parentWallet?.pmt_ref_no) { return { error: PARENT_WALLET_NOT_FOUND} }

		/* Fetch parent account balance */
		const balance = await getAccountBalance(parentWallet?.pmt_ref_no)
		if (balance?.status_code !== 0) { return { error: ERROR_FETCH_PARENT_WALLET} }
		parentWallet.balance = balance?.response_data?.balance

		return parentWallet;
	} catch (error) {
		return { error }
	}
}

/**
 * Distribute the amount of chore and weekly allowance as per config
 * 
 * @param {Number} spendingAllocation
 * @param {Number} weeklyAllowance
 * @param {Number} unpaidChoresTotal
 * @returns {Object}
 */
const calculateDistributedAmount = (spendingAllocation, weeklyAllowance, unpaidChoresTotal, unpaidLearningAmount) => {
	const savingAllocation = 100 - spendingAllocation
	return {
		spendingAmountWeekly: (weeklyAllowance * spendingAllocation) / 100,
		savingAmountWeekly: (weeklyAllowance * savingAllocation) / 100,
		spendingAmountChores: (unpaidChoresTotal * spendingAllocation) / 100,
		savingAmountChores: (unpaidChoresTotal * savingAllocation) / 100,
		spendingAmountLearning: (unpaidLearningAmount * spendingAllocation) / 100,
		savingAmountLearning: (unpaidLearningAmount * savingAllocation) / 100,
	}
}

/**
 * Check the value of distributed amount and transfer the money to repective accounts
 * 
 * @param {Object} distrbutedAmount 
 * @param {Object} parentAccount 
 * @param {Array} childWallets 
 * @returns {Boolean}
 */
const handleTransferMoney = async (distrbutedAmount, parentAccount, childWallets) => {
	try {
		const parentAccountNo = parentAccount.pmt_ref_no;
		const spendingAccount = childWallets.find(o => o.accountType === 'spending');
		const savingAccount = childWallets.find(o => o.accountType === 'saving');
		const spendingAccountNo = spendingAccount.pmt_ref_no;
		const savingAccountNo = savingAccount.pmt_ref_no;

		if (distrbutedAmount.spendingAmountWeekly) {
			const spendingAmountWeeklyResponse = await galileoAccountTransfer(parentAccountNo, spendingAccountNo, distrbutedAmount.spendingAmountWeekly, 'Spending transfer for weekly allowance')
			// console.log("spendingAmountWeeklyResponse : ", spendingAmountWeeklyResponse);
		}
		if (distrbutedAmount.savingAmountWeekly) {
			const savingAmountWeeklyResponse = await galileoAccountTransfer(parentAccountNo, savingAccountNo, distrbutedAmount.savingAmountWeekly, 'Savings transfer for weekly allowance')
			// console.log("savingAmountWeeklyResponse : ", savingAmountWeeklyResponse);
		}
		if (distrbutedAmount.spendingAmountChores) {
			const spendingAmountChoresResponse = await galileoAccountTransfer(parentAccountNo, spendingAccountNo, distrbutedAmount.spendingAmountChores, 'Spending transfer for chores')
			// console.log("spendingAmountChoresResponse : ", spendingAmountChoresResponse);
		}
		if (distrbutedAmount.savingAmountChores) {
			const savingAmountChoresResponse = await galileoAccountTransfer(parentAccountNo, savingAccountNo, distrbutedAmount.savingAmountChores, 'Savings transfer for chores')
			// console.log("savingAmountChoresResponse : ", savingAmountChoresResponse);
		}
		if (distrbutedAmount.spendingAmountLearning) {
			const spendingAmountLearningResponse = await galileoAccountTransfer(parentAccountNo, spendingAccountNo, distrbutedAmount.spendingAmountLearning, 'Spending transfer for learning allowance')
			// console.log("spendingAmountLearningResponse : ", spendingAmountLearningResponse);
		}
		if (distrbutedAmount.savingAmountLearning) {
			const savingAmountLearningResponse = await galileoAccountTransfer(parentAccountNo, savingAccountNo, distrbutedAmount.savingAmountLearning, 'Savings transfer for learning allowance')
			// console.log("savingAmountLearningResponse : ", savingAmountLearningResponse);
		}
		return true;
	} catch (error) {
		return { error }
	}
}

/**
 * Evalaute goals payments
 * 
 * @param {Array} activeGoals 
 * @param {Object} distributedAmount 
 * @param {String} uid 
 * @returns {Promise}
 */
const evaluateGoalsPayment = async (activeGoals, distributedAmount, uid) => {
	try {
		const totalSavings = distributedAmount.savingAmountWeekly + distributedAmount.savingAmountChores + distributedAmount.savingAmountLearning;
		let promise = [];
		activeGoals.forEach(goal => {
			const amount = (parseFloat(goal.weeklyAllocation) * totalSavings) / 100;
			if (amount) {
				promise.push(processGoalPayment(goal.id, amount));
			}
			if (goal.progressAmount + amount >= goal.goalAmount) {
				const notification = {
					uid,
					title: notifications.goal_completion.title,
					description: notifications.goal_completion.description(goal.title, goal.goalAmount),
					notificationType: notifications.goal_completion.type,
				};
				promise.push(createNotifications(null, [notification]));
			}
		});
		return await Promise.allSettled(promise);
	} catch (error) {
		throw error;
	}
};

/**
 * Evaluate payment amounts
 * 
 * @param {String} uid
 * @returns 
 */
const evaluateTransferAmounts = async (req, uid) => {

	try {
		/* Check id child's parent have premium susbcription */
		/* Fetch weekly allowance form config */
		const currentDay = moment().format('dddd').toLowerCase()
		const userConfigs = await getUserConfig(req, uid)

		if (!userConfigs || !userConfigs.length) {
			return { error: CONFIG_NOT_FOUND}
		}
		else if (userConfigs[0].weeklyAllowance.day !== currentDay) {
			return { error: INCORRECT_DAY}
		}
		const spendingAllocation = userConfigs[0]?.spendingAllocation ? parseFloat(userConfigs[0]?.spendingAllocation) : 70;
		const weeklyAllowance = userConfigs[0].weeklyAllowance?.amount ? parseFloat(userConfigs[0].weeklyAllowance?.amount) : 0; 

		/* Fetch child's the saving & spending accounts */
		const childWallets = await userAccount.find({ uid }).exec()
		if (!childWallets || !childWallets.length) { return { error: USER_ACC_NOT_FOUND} }

		/* Fetch parent account details & balance */
		const parentAccount = await fetchParentAccountDetails(uid)
		if (parentAccount.error) { return { error: parentAccount.error } }

		/* Fetch the non paid and approved chores with amount (sum) */
		const unpaidChores = await getUnpaidChores(req, uid)
		const unpaidTotal = unpaidChores && unpaidChores.length ? unpaidChores.reduce((total, chore) => total + chore.amount, 0) : 0
		const unpaidChoreIds = unpaidChores.map(chore => chore.choreId)

		/* Fetch the unpaid learning allowance transactionss*/
		const learningFilter = { uid, isPaid: false };
		const learningTransactions = await fetchLearningTransactions(req, learningFilter);
		const unpaidLearningAmount = learningTransactions && learningTransactions.length ? learningTransactions.reduce((total, txn) => total + parseFloat(txn.amount), 0) : 0;
		const unpaidLearningIds = learningTransactions.map(txn => txn._id)
		
		const totalPayable = weeklyAllowance + unpaidTotal + unpaidLearningAmount;
		if (!totalPayable) { return { error: 'No unpaid amount' } }
		else if (totalPayable > parentAccount?.balance) { return { error: INSUFFICENT_BALANCE } }

		/* Distribute the amount of chore and weekly allowance as per config */
		const distributedAmount = calculateDistributedAmount(spendingAllocation, weeklyAllowance, unpaidTotal, unpaidLearningAmount)

		/* Fetch the non paid and approved chores with amount (sum) */
		const activeGoals = await fetchGoals(uid, false);
		const goalsResponse = await evaluateGoalsPayment(activeGoals, distributedAmount, uid)


		/* Allowance saving, spending, chores saving & spending payment */
		const transfer = await handleTransferMoney(distributedAmount, parentAccount, childWallets)
		
		/* Mark the chore and learning transactions as paid for all records fetched in step 3 */
		await markChoresAsPaid(req, unpaidChoreIds)
		await markLearningTxnsAsPaid(req, unpaidLearningIds)

		return transfer
	} catch (error) {
		return { error }
	}
}

module.exports = evaluateTransferAmounts