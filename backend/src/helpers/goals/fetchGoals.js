

const db = require("../../mysql/models")

/**
 * Fetch goals
 * 
 * @param {String} uid
 * @param {Boolean} status
 * @returns {Object}
 */
const fetchGoals = async (uid, status) => {
	try {
		let filter = { uid };
		if (status !== undefined) { filter = { ...filter, status } }
		const goalData = await db.goals.findAll({
			 where: filter,
			 attributes: ['id', 'title', 'uid', 'weeklyAllocation', 'goalAmount', 'progressAmount', 'status'],
		});
		return goalData;
	} catch (error) {
		console.log("ERROR in fetchActiveGoals : ", error);
		throw error;
	}
};

module.exports = fetchGoals;