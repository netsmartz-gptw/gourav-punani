'use strict';

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const db = require('../mysql/models');
const { IDENTITY_VERFICATION_DETAILS, IDENTITY_VERFICATION_ALREADY_DONE, AGE_VALIDATION, GALILEO_CREATE_ACCOUNT_ERROR, GALILEO_CREATE_ACCOUNT_EXCEPTION } = require('../config/messages')
const { axiosInstance, ErrorHandler, setAccountFeature, jsonResponse } = require("../helpers");
const { userAccount, userConfig } = require("../modals");
const { PARENT_ACCOUNT_PID, DUPLICATE_SSN_CODE, E_SIGN_FEATURE_TYPE } = require("../config/galileoConfig");

/**
 * Create parent's Galileo account with KYC/CIP 
 * 
 * @param {Object} user 
 * @param {Object} userDetails 
 * @param {String} prodId 
 * @param {Function} next 
 * @returns {Object}
 */
const createGalileoAccount = async (userDetails, ssn, next) => {
	try {
		const transactionId = uuidv4(), countryCode = '840', idType = 2;
		const { GALILEO_API_LOGIN, GALILEO_API_TRANS_KEY, GALILEO_PROVIDER_ID } = process.env;

		const encodedParams = new URLSearchParams();
		encodedParams.set('apiLogin', GALILEO_API_LOGIN);
		encodedParams.set('apiTransKey', GALILEO_API_TRANS_KEY);
		encodedParams.set('providerId', GALILEO_PROVIDER_ID);
		encodedParams.set('transactionId', transactionId);
		encodedParams.set('prodId', PARENT_ACCOUNT_PID);
		encodedParams.set('firstName', userDetails.firstName);
		// encodedParams.set('middleName', 'P');
		encodedParams.set('lastName', userDetails.lastName);
		encodedParams.set('dateOfBirth', userDetails.dob);
		encodedParams.set('address1', userDetails.street_address);
		encodedParams.set('city', userDetails.city);
		encodedParams.set('state', userDetails.state);
		encodedParams.set('postalCode', userDetails.zip);
		encodedParams.set('countryCode', countryCode);
		encodedParams.set('primaryPhone', userDetails.phone_no);
		encodedParams.set('email', userDetails.email);
		encodedParams.set('idType', idType);
		encodedParams.set('id', ssn);
		encodedParams.set('loadAmount', 500); // MUST BE DELETED FOR APP IS RELEASED FOR PRODUCTION
		// encodedParams.set('expressMail', 'Y');
		// encodedParams.set('cipStatus', 1);
		// encodedParams.set('verifyOnly', 1);

		const galileoResponse = await axiosInstance.post('createAccount', encodedParams);
		return galileoResponse.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Save user KYC information in db and process Galileo KYC/CIP
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next  
 * @returns {JSON}
 */
const createAccount = async (req, res, next) => {
	try {
		const request = req.body;
		const dob = request.dob ? moment(request.dob).format('YYYY-MM-DD') : request.dob;
		const years = moment().diff(dob, 'years');
		if (years < 18) return jsonResponse(res, 400, AGE_VALIDATION)

		const user = await db.Users.findOne({
			where: { uid: req.body.uid },
			attributes: ['id', 'email']
		});

		// First check if identity verification is already done
		const count = await db.IdentityVerfications.count({
			where: { uid: req.body.uid }
		});
		if(count) return jsonResponse(res, 400, IDENTITY_VERFICATION_ALREADY_DONE)
	
		const userDetails = {
			firstName: request.firstName,
			lastName: request.lastName,
			email: user.email,
			dob:dob,
			streetAddress: request.street_address ? request.street_address.trim() : request.street_address,
			city: request.city,
			state: request.state,
			zip: request.zip,
			phoneNo: request.phone_no,
		};

		// Save identity verification details in database
		let verificationDetails = {
			uid: request.uid,
			// ...userDetails
		};
		
		/* DELETE IT AFTER PROFILE SCREEN IS DONE  */
		await db.Users.update(userDetails, { where: { uid: req.body.uid }});
		
		// Create galileo account
		// const parentAccount = await createGalileoAccount(verificationDetails, request.ssn, next);		
		const parentAccount = await createGalileoAccount(userDetails, request.ssn, next);	

		if (parentAccount?.errors && parentAccount?.errors.length) {
			return next(new ErrorHandler(400, parentAccount?.errors[0], null, parentAccount?.errors));
		}
		else if (parentAccount?.status_code && parentAccount?.status && parentAccount?.status_code === DUPLICATE_SSN_CODE) {
			return next(new ErrorHandler(400, parentAccount?.status, GALILEO_CREATE_ACCOUNT_EXCEPTION, parentAccount));
		}
		else if (!parentAccount?.response_data || !parentAccount?.response_data.length) {
			return next(new ErrorHandler(500, GALILEO_CREATE_ACCOUNT_ERROR, GALILEO_CREATE_ACCOUNT_EXCEPTION, parentAccount));
		}
		else if (parentAccount?.status_code !== 0) {
			return next(new ErrorHandler(500, null, null, parentAccount))
		}
		
		verificationDetails = { ...verificationDetails, cipStatus: 'pending' };
		await db.IdentityVerfications.create(verificationDetails);

		const userWalletData = {
			uid: req.body.uid,
			...parentAccount?.response_data[0],
			transactionId: parentAccount?.echo?.transaction_id,
			rtoken: parentAccount?.rtoken,
			accountType: 'primary',
		};
		await userAccount.create(userWalletData);
		await userConfig.findOneAndUpdate({ uid: req.body.uid }, { cipStatus: 'pending' }, {
			new: true,
			upsert: true
		});
		await setAccountFeature(parentAccount?.response_data[0]?.pmt_ref_no, E_SIGN_FEATURE_TYPE, "Y" );

		return res.status(201).send({
			statusCode: 201,
			response: {
				message:IDENTITY_VERFICATION_DETAILS,
				galileoResponse: parentAccount.data,
			}
		})
	}
	catch (error) {
		await db.IdentityVerfications.destroy({
			where: {
				uid: req.body.uid
			}
		})

		return next(new ErrorHandler(500, null, null, error));
	}
}

module.exports = createAccount