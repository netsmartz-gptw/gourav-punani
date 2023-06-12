const { v4: uuidv4 } = require('uuid');

require('dotenv').config({path:`${__dirname}/../../.env`});
const AWS = require('aws-sdk');

// Set the region 
AWS.config.update({ region: process.env.AWS_COGNITO_REGION });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const ALLOWANCE_QUEUE_URL = process.env.ALLOWANCE_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/000938590861/allowance-chores-payment"

/**
 * Fetch messages from AWS SQS
 * 
 * @param {Number} maxNumber 
 * @returns {Promise}
 */
const poolQueue = async (maxNumber = 10) => {
	return new Promise(async (resolve, reject) => {
		try {
			const params = {
				QueueUrl: ALLOWANCE_QUEUE_URL,
				AttributeNames: ['All'],
				MaxNumberOfMessages: maxNumber,
				ReceiveRequestAttemptId: 'STRING_VALUE', // Required for FIFO queues
				WaitTimeSeconds: 10
			}
			
			sqs.receiveMessage(params, (err, data) => {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Delete messages from queue
 * 
 * @param {Array} messages 
 * @returns {Promise}
 */
const deleteMessagesFromQueue = async (messages) => {
	return new Promise(async (resolve, reject) => {
		try {
			const entries = messages.map((item) => ({
				Id: uuidv4(), /* required */
				ReceiptHandle: item.ReceiptHandle /* required */
			}))
			const params = {
				Entries: entries,
				QueueUrl: ALLOWANCE_QUEUE_URL /* required */
			}

			sqs.deleteMessageBatch(params, (err, data) => {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			});
		} catch (error) {
			reject(error)
		}
	})
}

module.exports = {
	poolQueue,
	deleteMessagesFromQueue
}