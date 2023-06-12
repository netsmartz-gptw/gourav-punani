const { ErrorHandler } = require("../helpers")
const { transactionEvents, galileoWebHook, userAccount } = require("../modals")

const { GALILEO_WEBHOOK_TYPE_REQUIRED } = require("../config/messages")
const db = require('../mysql/models');
const { notifications } = require('../config/config');
const {
	createNotifications,
	getUserConfig,
	getCardInfo,
	setUserConfig,
} = require('../helpers');
const {
	LOST_WITH_REPLACEMENT_STATUS,
	LOST_WITHOUT_REPLACEMENT_STATUS,
	CARD_STATUS_LOST,
} = require("../config/galileoConfig");

/**
 * Check transaction user and send notification if account user is child
 * 
 * @param {Object} txnData 
 * @returns {Object}
 */
const checkTransactionUser = async (txnData) => {
	try {
		/* Fetch user wallet info */
		const walletInfo = await userAccount.findOne({
			pmt_ref_no: txnData.pmt_ref_no
		}).exec();
		if (!walletInfo?.uid) { return null; }

		/* Fetch child information from childUid and check have valid parent */
		const childInfo = await db.Users.findOne({
			where: { uid: walletInfo.uid },
			attributes: ['id', 'uid', 'firstName', 'lastName', 'email', 'dob', 'phoneNo'],
			include: {
				model: db.Users,
				as: 'parent',
				attributes: ['id', 'uid'],
				required: true
			},
			logging: false
		});
		if (!childInfo?.parent) { return null; }

		const notification = {
			uid: childInfo?.parent?.uid,
			title: notifications.child_transaction.title,
			description: notifications.child_transaction.description(txnData.amount, childInfo.firstName),
			notificationType: notifications.child_transaction.type,
		};
		return await createNotifications(null, [notification]);

	} catch (error) {
		console.log("ERROR in checkTransactionUser : ", error);
		return error;
	}
};

const checkAndUpdateIfNewCard = async (eventData) => {
	try {
		const walletInfo = await userAccount.findOne({
			pmt_ref_no: eventData.pmt_ref_no
		}).exec();
		if (!walletInfo?.uid) { return null; }

		const config = await getUserConfig(null, walletInfo?.uid);
		const newCardsStatuses = [LOST_WITH_REPLACEMENT_STATUS, LOST_WITHOUT_REPLACEMENT_STATUS];

		if (!config[0] || !newCardsStatuses.includes(config[0].physicalCardStatus)) return null;

		// Fetch information for the shipped card
		const cardInfo = await getCardInfo(eventData?.cad);
		if (cardInfo?.response_data?.status === CARD_STATUS_LOST) return null;

		const cardDetails = {
			card_id: cardInfo?.response_data?.card_id,
			card_number: cardInfo?.response_data?.card_number,
			expiry_date: cardInfo?.response_data?.expiry_date,
			card_security_code: cardInfo?.response_data?.card_security_code,
			new_emboss_uuid: cardInfo?.response_data?.emboss_uuid,
		};
		// Update card details and user config as per new card
		const updatedAccount = await userAccount.updateOne({ uid: walletInfo?.uid }, cardDetails);
		const updatedConfig = await setUserConfig({}, { physicalCardStatus: 'ordered' }, walletInfo?.uid, true);

		return { updatedAccount, updatedConfig, cardInfo };

	} catch (error) {
		console.log("ERROR while updating card : ", error);
		throw error;
	}
};


/**
 * Insert data from Galileo webhook in MongoDB
 * 
 * @param {Request Object} req 
 * @param {Response Object} res 
 * @param {Function} next 
 * @returns {JSON}
 */
const galileoDumpData = async (req, res, next) => {

	try {
		if (!req.body.type)
			return next(new ErrorHandler(500, null, null, { message: GALILEO_WEBHOOK_TYPE_REQUIRED, params: req.params, body: req.body }))

		const data = req.body

		await galileoWebHook.create(data);

		if (data.type === 'adj') {
			// Generate a notification for the transaction
			checkTransactionUser(data);
		}

		if (data.type === 'adj' || data.type === 'pmt') {

			const payload = {
				...data,
				details: data.description,
				bal_id: data.balance_id,
				post_ts: data.timestamp,
			}

			// save transaction log object in database
			await transactionEvents.create(payload)
		}

		// Check event type for new card shipped
		if (data.type === 'card_shipped') {
			const updatedCard = await checkAndUpdateIfNewCard(data);
		}

		return res.send({
			"success_code": "0"
		})
	}
	catch (err) {
		console.log("ERROR in galileoDumpData : ", err);
		return next(new ErrorHandler(500, null, null, err))
	}
}

module.exports = galileoDumpData