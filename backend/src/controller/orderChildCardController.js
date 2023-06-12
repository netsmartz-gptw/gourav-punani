'use strict';

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const db = require('../mysql/models');
const {
	CHILD_ACCOUNT_CREATED_SUCCESSFULLY,
	WRONG_CHILD,
	CHILD_ACCOUNT_ERROR,
	GALILEO_CREATE_ACCOUNT_EXCEPTION,
	CHILD_ACCOUNT_EXISTS,
	CHILD_ACCOUNT_EXISTS_EXCEPTION,
	CHILD_ACCOUNT_LIMIT_EXCEEDED,
	accounts
} = require('../config/messages')
const {
	axiosInstance,
	ErrorHandler,
	galileoAccountTransfer,
	jsonResponse
} = require("../helpers");
const { userAccount, userConfig } = require("../modals");
const {
	CHILD_SPENDING_ACCOUNT_PID,
	CHILD_SAVING_ACCOUNT_PID,
	SECONDARY_ACCOUNT_LIMIT_EXCEEDED_CODE,
	BETA_DEMO_CHILD_AMOUNT
} = require("../config/galileoConfig");

/**
 * Create child spending account as secondary using the Parent Savings PRN as the Primary
 * 
 * @param {Object} user
 * @param {Object} userDetails
 * @returns {Object}
 */
const createChildSpendingAccount = async (user, userDetails) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4(), countryCode = '840';

		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('prodId', CHILD_SPENDING_ACCOUNT_PID);
		encodedParams.set('firstName', user.firstName);
		encodedParams.set('lastName', user.lastName);
		if (user.email) { encodedParams.set('email', user.email); }
		encodedParams.set('dateOfBirth', userDetails.dob);
		encodedParams.set('address1', userDetails.street_address);
		encodedParams.set('city', userDetails.city);
		encodedParams.set('state', userDetails.state);
		encodedParams.set('postalCode', userDetails.zip);
		encodedParams.set('countryCode', countryCode);
		encodedParams.set('shipToAddress1', userDetails.street_address);
		encodedParams.set('shipToCity', userDetails.city);
		encodedParams.set('shipToState', userDetails.state);
		encodedParams.set('shipToPostalCode', userDetails.zip);
		encodedParams.set('shipToCountryCode', countryCode);
		encodedParams.set('cipStatus', 2);
		encodedParams.set('expressMail', 'Y');
		encodedParams.set('primaryAccount', userDetails.primaryAccountPRN);
		encodedParams.set('sharedBalance', 0);
		// encodedParams.set('loadAmount', 500); // MUST BE DELETED FOR APP IS RELEASED FOR PRODUCTION

		const galileoResponse = await axiosInstance.post('createAccount', encodedParams);
		return galileoResponse.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Create child's spending account as a secondary to the Child Spending Account
 * 
 * @param {String} spendingAccountNo
 * @returns {Object}
 */
const createChildSavingsAccount = async (spendingAccountNo) => {
	try {
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;
		const transactionId = uuidv4();

		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('prodId', CHILD_SAVING_ACCOUNT_PID);
		encodedParams.set('accountNo', spendingAccountNo);
		encodedParams.set('sharedBalance', 0);

		const galileoResponse = await axiosInstance.post('addAccount', encodedParams);
		return galileoResponse.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Save child's spending and saving account details in DB
 * 
 * @param {String} childUid 
 * @param {Object} spendingAccount 
 * @param {Object} savingAccount 
 * @returns {Promise}
 */
const saveChildAccount = async (childUid, spendingAccount, savingAccount) => {
	const userWalletData = [{
		uid: childUid,
		...spendingAccount?.response_data[0],
		transactionId: spendingAccount?.echo?.transaction_id,
		rtoken: spendingAccount?.rtoken,
		accountType: 'spending',
	}, {
		uid: childUid,
		...savingAccount?.response_data,
		transactionId: savingAccount?.echo?.transaction_id,
		rtoken: savingAccount?.rtoken,
		accountType: 'saving',
	}];
	return await userAccount.insertMany(userWalletData);
};

/**
 * Create child account and order card
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const orderChildCard = async (req, res, next) => {
	try {
		const request = req.body;

		/* Fetch child information from childUid and check have valid parent */
		const user = await db.Users.findOne({
			where: { uid: request.childUid },
			attributes: ['id', 'uid', 'firstName', 'lastName', 'email', 'dob', 'phoneNo'],
			include: {
				model: db.Users,
				as: 'parent',
				where: { uid: request.uid },
				attributes: ['id', 'uid'],
				required: true
			},
			logging: false
		});
		if (!user || !user.id) return jsonResponse(res, 400, WRONG_CHILD)

		/* Check if child account is already exist */
		const childAccCount = await userAccount.count({ uid: request.childUid }).select('uid pmt_ref_no galileo_account_number accountType').exec();
		if (childAccCount > 0) return jsonResponse(res, 400, CHILD_ACCOUNT_EXISTS, null, CHILD_ACCOUNT_EXISTS_EXCEPTION)

		/* Fetch parent's account details */
		const parentAccount = await userAccount.findOne({ uid: request.uid }).select('uid pmt_ref_no galileo_account_number accountType').exec();
		if (!parentAccount) return jsonResponse(res, 400, accounts.wallet_not_created_error)

		const userDetails = {
			streetAddress: request.streetAddress ? request.streetAddress.trim() : request.streetAddress,
			city: request.city,
			state: request.state,
			zip: request.zip,
		};
		
		/* DELETE IT AFTER PROFILE SCREEN IS DONE */
		await db.Users.update(userDetails, { where: { uid: request.childUid }});

		const dob = user.dob ? moment(user.dob).format('YYYY-MM-DD') : user.dob;

		const childAccountInfo = {
			...userDetails,
			dob,
			primaryAccountPRN: parentAccount.pmt_ref_no
		};

		/* CREATE CHILD SPENDING ACCOUNT */
		const spendingAccount = await createChildSpendingAccount(user, childAccountInfo, next);
		if (spendingAccount?.errors && spendingAccount?.errors.length) {
			return next(new ErrorHandler(500, spendingAccount?.errors[0], null, spendingAccount?.errors));
		} 
		else if (spendingAccount?.status_code && spendingAccount?.status_code === SECONDARY_ACCOUNT_LIMIT_EXCEEDED_CODE) {
			return next(new ErrorHandler(500, CHILD_ACCOUNT_LIMIT_EXCEEDED, GALILEO_CREATE_ACCOUNT_EXCEPTION, spendingAccount));
		}
		else if (!spendingAccount?.response_data || !spendingAccount?.response_data.length) {
			return next(new ErrorHandler(500, CHILD_ACCOUNT_ERROR, GALILEO_CREATE_ACCOUNT_EXCEPTION, spendingAccount));
		}
		else if (spendingAccount?.status_code !== 0) {
			return next(new ErrorHandler(500, null, null, spendingAccount))
		}
		
		/* CREATE CHILD SAVING ACCOUNT */
		const savingAccount = await createChildSavingsAccount(spendingAccount?.response_data[0].pmt_ref_no);
		if (savingAccount?.errors && savingAccount?.errors.length) {
			return next(new ErrorHandler(500, savingAccount?.errors[0], null, savingAccount?.errors));
		}
		else if (!savingAccount?.response_data?.pmt_ref_no) {
			return next(new ErrorHandler(500, CHILD_ACCOUNT_ERROR, GALILEO_CREATE_ACCOUNT_EXCEPTION, savingAccount));
		}
		else if (savingAccount?.status_code !== 0) {
			return next(new ErrorHandler(500, null, null, savingAccount))
		}
		await saveChildAccount(request.childUid, spendingAccount, savingAccount);

		/* TRANSFER BETA AMOUNT TO CHILD */
		if (BETA_DEMO_CHILD_AMOUNT) {
			await galileoAccountTransfer(parentAccount.pmt_ref_no, spendingAccount?.response_data[0].pmt_ref_no, BETA_DEMO_CHILD_AMOUNT);
		}

		await userConfig.findOneAndUpdate({ uid: request.childUid }, { physicalCardStatus: 'ordered' }, {
			new: true,
			upsert: true
		});

		return jsonResponse(res, 201, CHILD_ACCOUNT_CREATED_SUCCESSFULLY)
	}
	catch (error) {
		return next(new ErrorHandler(500, null, null, error));
	}
};

module.exports = orderChildCard;