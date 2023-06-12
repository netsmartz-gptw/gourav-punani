'use strict';

const { poolQueue, deleteMessagesFromQueue } = require('../helpers/queueHandler')
const { notifications } = require('../modals')
const { NO_MESSAGES_FOUND, QUEUE_PROCESSED, ERROR_PROCESSING_QUEUE } = require('../config/messages')

const { Logger, evaluateTransferAmounts } = require('../helpers');
const logger = new Logger('cron');

/**
 * Pool the records from AWS SQS and process allowance payment
 */
const processQueue = async (req, res, next) => {
	try {
		const messages = await poolQueue()
		if (!messages.Messages || !messages.Messages.length) {
			return { success: false, message: NO_MESSAGES_FOUND }
		}
		for (const message of messages.Messages) {
			const msg = JSON.parse(message.Body)
			const result = await evaluateTransferAmounts(req, msg.uid);
			console.log("result", result)
			logger.info("<<<<<< RESULT >>>>>>>>", { uid: msg.uid, result })
			if (result.error) {
				const msg = result.error?.message ? result.error.message : result.error
				await notifications.create({ uid: message.Body, message: msg })
			}
		}

		await deleteMessagesFromQueue(messages.Messages)
		logger.info(QUEUE_PROCESSED, { success: true, messages })
		return { success: true, message: QUEUE_PROCESSED }
	} catch (error) {
		logger.error(ERROR_PROCESSING_QUEUE, { success: false, error });
		return { success: false, message: ERROR_PROCESSING_QUEUE, error }
	}
}

module.exports = processQueue