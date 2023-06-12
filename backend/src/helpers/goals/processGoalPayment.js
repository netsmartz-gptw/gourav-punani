const db = require("../../mysql/models")

/**
 * Process goals payment
 * 
 * @param {String} uid
 * @param {Boolean} status
 * @returns {Object}
 */
const processGoalPayment = async (goalId, amount) => {
	try {
		const goalData = await db.goals.increment('progressAmount', {
			by: amount,
			where: { id: goalId },
		});
		return goalData;
	} catch (error) {
		console.log("ERROR in processGoalPayment : ", error);
		throw error;
	}
};

module.exports = processGoalPayment;